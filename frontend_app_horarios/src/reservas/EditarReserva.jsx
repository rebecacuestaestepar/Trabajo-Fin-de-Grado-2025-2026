// src/pages/EditarReserva.jsx
// TODO EN UN SOLO ARCHIVO: carga detalle, autocompleta, edita (menos ID),
// busca aulas candidatas, guarda con PATCH, aprueba/rechaza y vuelve a pendientes.

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getReservaDetalle,
  patchReserva,
  postAulasCandidatas,
  aprobarReserva,
  rechazarReserva,
} from "../api/reservas";

/* ========================= UI helpers ========================= */
function Field({ label, children, hint }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
      <label className="text-sm font-medium text-slate-700 sm:col-span-4">
        {label}
      </label>
      <div className="sm:col-span-8">
        {children}
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "shadow-sm outline-none transition",
        "focus:border-[#7a1e1e] focus:ring-2 focus:ring-[#7a1e1e]/20",
        "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function Check({ checked, onChange, label, disabled }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 accent-[#7a1e1e] disabled:cursor-not-allowed"
      />
      <span className={disabled ? "text-slate-500" : ""}>{label}</span>
    </label>
  );
}

function ModalConfirm({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmText,
  danger,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white",
              danger
                ? "bg-rose-700 hover:bg-rose-800"
                : "!bg-[#7a1e1e] hover:bg-[#651818]",
            ].join(" ")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================= Mapping (DRF snake_case) ========================= */
function normalizeTime(t) {
  if (!t) return "";
  // "HH:MM:SS" -> "HH:MM"
  return String(t).slice(0, 5);
}

const emptyForm = {
  idreserva: "",
  correo_responsable: "",
  motivo: "",
  fecha: "",
  hora_inicio: "",
  hora_fin: "",
  capacidad_solicitada: "",
  num_ordenadores: "",
  altavoces: false,
  proyector: false,
  camara: false,
  enchufes: false,
  nombre_aula: "",
  estado: "",
};

function mapReservaToForm(r) {
  if (!r) return { ...emptyForm };
  return {
    idreserva: r.idreserva ?? "",
    correo_responsable: r.correo_responsable ?? "",
    motivo: r.motivo ?? "",
    fecha: r.fecha ?? "",
    hora_inicio: normalizeTime(r.hora_inicio),
    hora_fin: normalizeTime(r.hora_fin),
    capacidad_solicitada: r.capacidad_solicitada == null ? "" : String(r.capacidad_solicitada),
    num_ordenadores: r.num_ordenadores == null ? "" : String(r.num_ordenadores),
    altavoces: Boolean(r.altavoces),
    proyector: Boolean(r.proyector),
    camara: Boolean(r.camara),
    enchufes: Boolean(r.enchufes),
    nombre_aula: r.nombre_aula ?? "",
    estado: r.estado ?? "",
  };
}

/* ========================= Utils ========================= */
function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
}

/* ========================= MAIN ========================= */
export default function EditarReserva() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });
  const [initialForm, setInitialForm] = useState({ ...emptyForm });

  const [aulas, setAulas] = useState([]);
  const [cargandoAulas, setCargandoAulas] = useState(false);

  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState(null); // "approve" | "reject"

  // 1) GET detalle y autocompletar
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError(null);
    setMensaje(null);
    setErrores(null);
    setAulas([]);

    getReservaDetalle(id)
      .then((data) => {
        if (!mounted) return;
        const mapped = mapReservaToForm(data);
        setForm(mapped);
        setInitialForm(mapped);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setLoadError("No se pudo cargar la reserva.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const patch = (p) => setForm((prev) => ({ ...prev, ...p }));

  const puedeBuscarAulas = useMemo(() => {
    return (
      !!form.fecha &&
      !!form.hora_inicio &&
      !!form.hora_fin &&
      String(form.capacidad_solicitada).trim() !== ""
    );
  }, [form.fecha, form.hora_inicio, form.hora_fin, form.capacidad_solicitada]);

  const puedeGuardar = useMemo(() => {
    return (
      !!form.fecha &&
      !!form.hora_inicio &&
      !!form.hora_fin &&
      String(form.capacidad_solicitada).trim() !== ""
    );
  }, [form.fecha, form.hora_inicio, form.hora_fin, form.capacidad_solicitada]);

  const hayCambios = useMemo(() => !shallowEqual(form, initialForm), [form, initialForm]);

  // 2) Buscar aulas candidatas (endpoint: /reservas/<id>/aulas-candidatas/)
  const buscarAulas = async () => {
    setErrores(null);
    setMensaje(null);
    setCargandoAulas(true);

    const payload = {
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      capacidad_solicitada: Number(form.capacidad_solicitada || 0),
      num_ordenadores: form.num_ordenadores === "" ? 0 : Number(form.num_ordenadores),
      altavoces: form.altavoces,
      proyector: form.proyector,
      camara: form.camara,
      enchufes: form.enchufes,
    };

    try {
      const data = await postAulasCandidatas(form.idreserva, payload);
      const lista = data?.aulas ?? data ?? [];
      const arr = Array.isArray(lista) ? lista : [];
      setAulas(arr);

      if (arr.length > 0 && !arr.some((a) => a.nombre === form.nombre_aula)) {
        patch({ nombre_aula: arr[0].nombre });
      }
      if (arr.length === 0) setMensaje("No hay aulas candidatas para esos criterios.");
    } catch (e) {
      console.error(e);
      setErrores(e?.data || { general: "Error al buscar aulas candidatas" });
      setAulas([]);
    } finally {
      setCargandoAulas(false);
    }
  };

  // 3) Guardar (PATCH /reservas/<id>/)
  const guardar = async () => {
    setErrores(null);
    setMensaje(null);

    // En PATCH puedes enviar solo campos (parcial). Aquí enviamos todo excepto idreserva/estado
    const parcial = {
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      motivo: form.motivo,
      correo_responsable: form.correo_responsable,
      capacidad_solicitada: form.capacidad_solicitada === "" ? null : Number(form.capacidad_solicitada),
      num_ordenadores: form.num_ordenadores === "" ? null : Number(form.num_ordenadores),
      altavoces: form.altavoces,
      proyector: form.proyector,
      camara: form.camara,
      enchufes: form.enchufes,
      nombre_aula: form.nombre_aula,
    };

    try {
      const res = await patchReserva(form.idreserva, parcial);
      setMensaje(res?.message || "Cambios guardados correctamente");

      // refresca estado base para que "hayCambios" vuelva a false
      setInitialForm((prev) => ({ ...prev, ...form }));
    } catch (e) {
      console.error(e);
      setErrores(e?.data || { general: "Error al guardar cambios" });
    }
  };

  // 4) Aprobar / Rechazar + volver a pendientes
  const askApprove = () => {
    setConfirmKind("approve");
    setConfirmOpen(true);
  };
  const askReject = () => {
    setConfirmKind("reject");
    setConfirmOpen(true);
  };

  const doConfirm = async () => {
    setConfirmOpen(false);
    setErrores(null);
    setMensaje(null);

    try {
      if (confirmKind === "approve") {
        const res = await aprobarReserva(form.idreserva);
        setMensaje(res?.message || "Reserva aprobada");
      } else if (confirmKind === "reject") {
        const res = await rechazarReserva(form.idreserva);
        setMensaje(res?.message || "Reserva rechazada");
      }
      navigate("/reservas/pendientes/");
    } catch (e) {
      console.error(e);
      setErrores(e?.data || { general: "Error al cambiar el estado" });
    } finally {
      setConfirmKind(null);
    }
  };

  // UI states
  if (loading) return <div className="p-6">Cargando reserva...</div>;
  if (loadError) return <div className="p-6 text-rose-700">{loadError}</div>;

  const confirmTitle = confirmKind === "approve" ? "¿Aceptar solicitud?" : "¿Rechazar solicitud?";
  const confirmDesc =
    confirmKind === "approve"
      ? "Vas a aprobar esta solicitud. El estado cambiará a Aprobada."
      : "Vas a rechazar esta solicitud. El estado cambiará a Rechazada.";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">
      <ModalConfirm
        open={confirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doConfirm}
        confirmText={confirmKind === "approve" ? "Aceptar" : "Rechazar"}
        danger={confirmKind === "reject"}
      />

      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-[#7a1e1e]/60 bg-white shadow-sm">
          <div className="border-b border-[#7a1e1e]/30 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate("/reservas/pendientes/")}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                ← Volver
              </button>

              <h1 className="text-center text-lg font-semibold tracking-wide text-slate-900">
                EDITAR RESERVA
              </h1>

              <span />
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            {/* Datos principales */}
            <div className="space-y-4">
              <Field label="ID Reserva">
                <TextInput value={form.idreserva} disabled readOnly />
              </Field>

              <Field label="Correo responsable">
                <TextInput
                  type="email"
                  value={form.correo_responsable}
                  onChange={(e) => patch({ correo_responsable: e.target.value })}
                />
              </Field>

              <Field label="Motivo">
                <TextArea
                  value={form.motivo}
                  onChange={(e) => patch({ motivo: e.target.value })}
                  rows={3}
                  placeholder="Describe brevemente el motivo…"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fecha">
                  <TextInput
                    type="date"
                    value={form.fecha}
                    onChange={(e) => patch({ fecha: e.target.value })}
                  />
                </Field>

                <Field label="Capacidad solicitada">
                  <TextInput
                    type="number"
                    min={0}
                    value={form.capacidad_solicitada}
                    onChange={(e) => patch({ capacidad_solicitada: e.target.value })}
                  />
                </Field>

                <Field label="Hora inicio">
                  <TextInput
                    type="time"
                    value={form.hora_inicio}
                    onChange={(e) => patch({ hora_inicio: e.target.value })}
                  />
                </Field>

                <Field label="Hora fin">
                  <TextInput
                    type="time"
                    value={form.hora_fin}
                    onChange={(e) => patch({ hora_fin: e.target.value })}
                  />
                </Field>

                <Field label="Nº ordenadores">
                  <TextInput
                    type="number"
                    min={0}
                    value={form.num_ordenadores}
                    onChange={(e) => patch({ num_ordenadores: e.target.value })}
                    placeholder="Opcional"
                  />
                </Field>

                <Field label="Estado">
                  <TextInput value={form.estado} disabled readOnly />
                </Field>
              </div>
            </div>

            {/* Recursos */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">
                Recursos solicitados
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Check
                  checked={form.altavoces}
                  onChange={(e) => patch({ altavoces: e.target.checked })}
                  label="Necesito altavoces"
                />
                <Check
                  checked={form.proyector}
                  onChange={(e) => patch({ proyector: e.target.checked })}
                  label="Necesito proyector"
                />
                <Check
                  checked={form.camara}
                  onChange={(e) => patch({ camara: e.target.checked })}
                  label="Necesito cámaras"
                />
                <Check
                  checked={form.enchufes}
                  onChange={(e) => patch({ enchufes: e.target.checked })}
                  label="Necesito enchufes"
                />
              </div>
            </div>

            {/* Aula + buscar aulas candidatas */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  Aula candidata
                </h2>

                <button
                  type="button"
                  onClick={buscarAulas}
                  disabled={cargandoAulas || !puedeBuscarAulas}
                  className={[
                    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
                    "bg-white text-[#7a1e1e] ring-1 ring-[#7a1e1e]/50 hover:bg-[#7a1e1e]/5",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  ].join(" ")}
                >
                  {cargandoAulas ? "Buscando aulas..." : "Buscar aulas candidatas"}
                </button>
              </div>

              <div className="mt-4">
                <Field
                  label="Aula"
                  hint={
                    aulas.length
                      ? "Selecciona un aula de la lista."
                      : 'Pulsa "Buscar aulas candidatas" para cargar opciones.'
                  }
                >
                  {aulas.length ? (
                    <SelectInput
                      value={form.nombre_aula}
                      onChange={(e) => patch({ nombre_aula: e.target.value })}
                    >
                      {aulas.map((a) => (
                        <option key={a.nombre} value={a.nombre}>
                          {a.nombre} — cap {a.capacidad} — pcs {a.num_ordenadores}
                        </option>
                      ))}
                    </SelectInput>
                  ) : (
                    <TextInput
                      value={form.nombre_aula}
                      onChange={(e) => patch({ nombre_aula: e.target.value })}
                      placeholder="A-101"
                    />
                  )}
                </Field>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={askReject}
                className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold ring-1 ring-rose-300 text-rose-700 hover:bg-rose-50"
              >
                Rechazar
              </button>

              <button
                type="button"
                onClick={askApprove}
                className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white !bg-[#7a1e1e] hover:bg-[#651818]"
              >
                Aceptar
              </button>

              <button
                type="button"
                onClick={guardar}
                disabled={!puedeGuardar || !hayCambios}
                className={[
                  "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white transition",
                  "!bg-slate-700 hover:bg-slate-800",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
              >
                Guardar cambios
              </button>
            </div>

            {/* Mensajes */}
            {mensaje && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {mensaje}
              </div>
            )}

            {errores && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-800">Errores</p>
                <pre className="mt-2 overflow-auto text-xs text-rose-800">
                  {JSON.stringify(errores, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
