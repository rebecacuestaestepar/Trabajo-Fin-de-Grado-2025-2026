from __future__ import annotations

import re
from pathlib import Path
from typing import List

import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from typing import Dict, Set

def get_db_tables() -> List[str]:
    """Tablas del proyecto (excluye tablas internas de Django)."""
    with connection.cursor() as cursor:
        tables = connection.introspection.table_names(cursor)

    # Ajusta si tienes otras tablas internas
    ignore_prefixes = ("django_", "auth_", "admin_", "sessions_", "django_content_type")
    ignore_exact = {"django_migrations"}

    return [t for t in tables if not t.startswith(ignore_prefixes) and t not in ignore_exact]


def get_fk_dependencies(tables: List[str]) -> Dict[str, Set[str]]:
    """
    Grafo: tabla -> set(tablas de las que depende (referenciadas por FK))
    """
    deps: Dict[str, Set[str]] = {t: set() for t in tables}
    tables_set = set(tables)

    with connection.cursor() as cursor:
        for t in tables:
            constraints = connection.introspection.get_constraints(cursor, t)
            for _cname, cinfo in constraints.items():
                fk = cinfo.get("foreign_key")
                if fk:
                    ref_table, _ref_col = fk
                    if ref_table in tables_set:
                        deps[t].add(ref_table)
    return deps


def topo_sort(deps: Dict[str, Set[str]]) -> List[str]:
    """Orden topológico simple."""
    remaining = {t: set(d) for t, d in deps.items()}
    result: List[str] = []

    while remaining:
        ready = [t for t, d in remaining.items() if not d]
        if not ready:
            # Si hay ciclo, devolvemos el resto en orden alfabético para no bloquear
            result.extend(sorted(remaining.keys()))
            break

        ready.sort()
        result.extend(ready)

        for t in ready:
            remaining.pop(t, None)
        for t in remaining:
            remaining[t].difference_update(ready)

    return result

def normalize_bool(x):
    if pd.isna(x):
        return None
    if isinstance(x, bool):
        return x
    s = str(x).strip().lower()
    if s in {"true", "1", "yes", "y", "si", "sí"}:
        return True
    if s in {"false", "0", "no", "n"}:
        return False
    return x


def sql_ident(name: str) -> str:
    # Evita inyección por nombres (tablas/columnas)
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", name):
        raise CommandError(f"Nombre no válido: {name}")
    return name

def to_db_value(v):
    # convierte NaN/NaT a None
    if v is None:
        return None
    if isinstance(v, float) and pd.isna(v):
        return None
    if pd.isna(v):
        return None
    return v

"""
def get_db_tables() -> List[str]:
    with connection.cursor() as cursor:
        tables = connection.introspection.table_names(cursor)
    # Filtra tablas internas típicas
    return [t for t in tables if not t.startswith("django_")]
"""

def get_table_columns(table: str) -> List[str]:
    with connection.cursor() as cursor:
        desc = connection.introspection.get_table_description(cursor, table)
    return [c.name for c in desc]


class Command(BaseCommand):
    help = "Importa desde Excel a MySQL (borrando antes) o exporta MySQL a Excel."

    def add_arguments(self, parser):
        parser.add_argument("mode", choices=["import", "export"])
        parser.add_argument("--file", required=True, help="Ruta al .xlsx")
        parser.add_argument("--only", nargs="*", default=None, help="Tablas a procesar (opcional)")

    def handle(self, *args, **opts):
        mode = opts["mode"]
        xlsx_path = Path(opts["file"]).resolve()
        only = opts["only"]

        if mode == "import":
            self.import_from_excel(xlsx_path, only)
        else:
            self.export_to_excel(xlsx_path, only)

    def import_from_excel(self, xlsx_path: Path, only: List[str] | None):
        if not xlsx_path.exists():
            raise CommandError(f"No existe el fichero: {xlsx_path}")

        if connection.vendor != "mysql":
            raise CommandError(f"Este comando está ajustado para MySQL. Vendor actual: {connection.vendor}")

        db_tables = get_db_tables()

        if only:
            only_set = set(only)
            db_tables = [t for t in db_tables if t in only_set]

        deps = get_fk_dependencies(db_tables)
        insert_order = topo_sort(deps)               # padres -> hijas
        delete_order = list(reversed(insert_order))  # hijas -> padres


        xl = pd.ExcelFile(xlsx_path)
        sheet_names = set(xl.sheet_names)

        tables_in_excel = [t for t in insert_order if t in sheet_names]
        missing = [t for t in db_tables if t not in sheet_names]
        if missing:
            self.stdout.write(self.style.WARNING(
                "OJO: estas tablas existen en BD pero NO tienen hoja en el Excel (se omiten): "
                + ", ".join(missing)
            ))

        with transaction.atomic():
            # 1) Borrado previo total
            self.stdout.write("Borrando datos existentes (MySQL)…")
            with connection.cursor() as cursor:
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
                for t in delete_order:
                    if t in sheet_names:  # solo tablas presentes en el Excel
                        cursor.execute(f"DELETE FROM {sql_ident(t)};")
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

            # 2) Inserts desde Excel
            self.stdout.write("Insertando datos desde Excel…")
            for table in tables_in_excel:
                self.stdout.write(f"  -> Procesando tabla/hoja: {table}")
                 # 1) Leer hoja
                df = xl.parse(table)
                df = df.replace({pd.NA: None})
                df = df.where(pd.notnull(df), None)


                if df.empty:
                    continue

                df = df.where(pd.notnull(df), None)

                db_cols = get_table_columns(table)
                excel_cols = list(df.columns)

                unknown = [c for c in excel_cols if c not in db_cols]
                if unknown:
                    raise CommandError(f"En hoja {table} hay columnas que no existen en BD: {unknown}")

                # normaliza booleanos (si hay columnas booleanas)
                for c in excel_cols:
                    # ajusta aquí si tienes nombres concretos
                    if c.upper() in {"ALTAVOCES", "PROYECTOR", "CAMARAS", "ENCHUFES"}:
                        df[c] = df[c].map(normalize_bool)

                cols_sql = ", ".join(sql_ident(c) for c in excel_cols)
                placeholders = ", ".join(["%s"] * len(excel_cols))
                sql = f"INSERT INTO {sql_ident(table)} ({cols_sql}) VALUES ({placeholders})"

                #rows = [tuple(row[c] for c in excel_cols) for _, row in df.iterrows()]
                #rows = [
                #    tuple(to_db_value(row[c]) for c in excel_cols)
                #    for _, row in df.iterrows()
                #]
                rows = []
                for record in df.to_dict('records'):
                    rows.append(tuple(to_db_value(record[c]) for c in excel_cols))

                with connection.cursor() as cursor:
                    cursor.executemany(sql, rows)

        self.stdout.write(self.style.SUCCESS("Importación completada: BD = solo datos del Excel."))

    def export_to_excel(self, xlsx_path: Path, only: List[str] | None):
        if connection.vendor != "mysql":
            raise CommandError(f"Este comando está ajustado para MySQL. Vendor actual: {connection.vendor}")

        tables = get_db_tables()
        if only:
            only_set = set(only)
            tables = [t for t in tables if t in only_set]

        xlsx_path.parent.mkdir(parents=True, exist_ok=True)

        with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
            for table in tables:
                with connection.cursor() as cursor:
                    cursor.execute(f"SELECT * FROM {sql_ident(table)};")
                    cols = [col[0] for col in cursor.description]
                    rows = cursor.fetchall()

                pd.DataFrame(rows, columns=cols).to_excel(writer, sheet_name=table, index=False)

        self.stdout.write(self.style.SUCCESS(f"Exportación completada: {xlsx_path}"))
