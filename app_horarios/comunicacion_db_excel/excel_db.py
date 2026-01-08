from __future__ import annotations

import re
from pathlib import Path
from typing import List

import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction


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


def get_db_tables() -> List[str]:
    with connection.cursor() as cursor:
        tables = connection.introspection.table_names(cursor)
    # Filtra tablas internas típicas
    return [t for t in tables if not t.startswith("django_")]


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

        xl = pd.ExcelFile(xlsx_path)
        sheet_names = set(xl.sheet_names)

        tables_in_excel = [t for t in db_tables if t in sheet_names]
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
                for t in db_tables:
                    cursor.execute(f"DELETE FROM {sql_ident(t)};")
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

            # 2) Inserts desde Excel
            self.stdout.write("Insertando datos desde Excel…")
            for table in tables_in_excel:
                df = xl.parse(table)

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

                rows = [tuple(row[c] for c in excel_cols) for _, row in df.iterrows()]

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
