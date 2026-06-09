import { useEffect, useMemo, useState } from "react";
import {
  getReservaDetalle,
  patchReserva,
  postAulasCandidatas,
  aprobarReserva,
  rechazarReserva,
  eliminarReserva,
} from "../../api/reservas";

import igualdadSuperficial from "../formulario-utiles/igualdadSuperficial";

function normalizarHora(h) {
  if (!h) return "";
  return String(h).slice(0, 5);
}

const formularioVacio = {
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

function mapReservaAFormulario(r) {
  if (!r) return { ...formularioVacio };

  const cam = r.camara ?? r.camaras ?? false;

  return {
    idreserva: r.idreserva ?? "",
    correo_responsable: r.correo_responsable ?? "",
    motivo: r.motivo ?? "",
    fecha: r.fecha ?? "",
    hora_inicio: normalizarHora(r.hora_inicio),
    hora_fin: normalizarHora(r.hora_fin),
    capacidad_solicitada:
      r.capacidad_solicitada == null ? "" : String(r.capacidad_solicitada),
    num_ordenadores: r.num_ordenadores == null ? "" : String(r.num_ordenadores),
    altavoces: Boolean(r.altavoces),
    proyector: Boolean(r.proyector),
    camara: Boolean(cam),
    enchufes: Boolean(r.enchufes),
    id_aula: r.id_aula ?? "",
    nombre_aula: r.nombre_aula ?? "",
    estado: r.estado ?? "",
  };
}

export function useEditarReserva(id, { onFinish } = {}) {
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [formulario, setFormulario] = useState({ ...formularioVacio });
  const [formularioInicial, setFormularioInicial] = useState({ ...formularioVacio });

  const [aulasDisponibles, setAulasDisponibles] = useState([]);
  const [buscandoAulas, setBuscandoAulas] = useState(false);

  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState(null);

  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [tipoConfirmacion, setTipoConfirmacion] = useState(null);

  const [recursosBuscados, setRecursosBuscados] = useState(null);

  const aplicarCambios = (parcial) =>
    setFormulario((prev) => ({ ...prev, ...parcial }));

  
  useEffect(() => {
    let montado = true;

    setCargando(true);
    setErrorCarga(null);
    setMensaje(null);
    setErrores(null);
    setAulasDisponibles([]);

    getReservaDetalle(id)
      .then((data) => {
        if (!montado) return;
        const mapped = mapReservaAFormulario(data);
        setFormulario(mapped);
        setFormularioInicial(mapped);

        setRecursosBuscados({
          fecha: mapped.fecha,
          hora_inicio: mapped.hora_inicio,
          hora_fin: mapped.hora_fin,
          capacidad_solicitada: mapped.capacidad_solicitada,
          num_ordenadores: mapped.num_ordenadores,
          altavoces: mapped.altavoces,
          proyector: mapped.proyector,
          camara: mapped.camara,
          enchufes: mapped.enchufes,
        });

        if (mapped.id_aula && mapped.nombre_aula) {
          setAulasDisponibles([
            {
              nombre: mapped.nombre_aula,
              capacidad: mapped.capacidad_solicitada || "—",
              num_ordenadores: mapped.num_ordenadores || "—",
            },
          ]);
        }
      })
      .catch((e) => {
        console.error(e);
        if (!montado) return;
        setErrorCarga("No se pudo cargar la reserva.");
      })
      .finally(() => {
        if (!montado) return;
        setCargando(false);
      });

    return () => {
      montado = false;
    };
  }, [id]);


  const puedeBuscarAulas = useMemo(() => {
    return (
      !!formulario.fecha &&
      !!formulario.hora_inicio &&
      !!formulario.hora_fin &&
      String(formulario.capacidad_solicitada).trim() !== ""
    );
  }, [formulario.fecha, formulario.hora_inicio, formulario.hora_fin, formulario.capacidad_solicitada]);

  const recursosModificados = useMemo(() => {
    if (!recursosBuscados) return false;
    return (
      formulario.fecha !== recursosBuscados.fecha ||
      formulario.hora_inicio !== recursosBuscados.hora_inicio ||
      formulario.hora_fin !== recursosBuscados.hora_fin ||
      formulario.capacidad_solicitada !== recursosBuscados.capacidad_solicitada ||
      formulario.num_ordenadores !== recursosBuscados.num_ordenadores ||
      formulario.altavoces !== recursosBuscados.altavoces ||
      formulario.proyector !== recursosBuscados.proyector ||
      formulario.camara !== recursosBuscados.camara ||
      formulario.enchufes !== recursosBuscados.enchufes
    );
  }, [formulario, recursosBuscados]);

  const puedeGuardar = useMemo(() => {
    return (
      !!formulario.fecha &&
      !!formulario.hora_inicio &&
      !!formulario.hora_fin &&
      String(formulario.capacidad_solicitada).trim() !== "" &&
      !recursosModificados
    );
  }, [formulario.fecha, formulario.hora_inicio, formulario.hora_fin, formulario.capacidad_solicitada, recursosModificados]);

  const hayCambios = useMemo(() => {
    return !igualdadSuperficial(formulario, formularioInicial);
  }, [formulario, formularioInicial]);


  const buscarAulas = async () => {
    setErrores(null);
    setMensaje(null);
    setBuscandoAulas(true);

    const payload = {
      fecha: formulario.fecha,
      hora_inicio: formulario.hora_inicio,
      hora_fin: formulario.hora_fin,
      capacidad_solicitada: Number(formulario.capacidad_solicitada || 0),
      num_ordenadores:
        formulario.num_ordenadores === "" ? 0 : Number(formulario.num_ordenadores),
      altavoces: formulario.altavoces,
      proyector: formulario.proyector,
      camara: formulario.camara,
      enchufes: formulario.enchufes,
    };

    try {
      const data = await postAulasCandidatas(formulario.idreserva, payload);
      const lista = data?.aulas ?? data ?? [];
      const arr = Array.isArray(lista) ? lista : [];

      setAulasDisponibles(arr);

      setRecursosBuscados({
        fecha: formulario.fecha,
        hora_inicio: formulario.hora_inicio,
        hora_fin: formulario.hora_fin,
        capacidad_solicitada: formulario.capacidad_solicitada,
        num_ordenadores: formulario.num_ordenadores,
        altavoces: formulario.altavoces,
        proyector: formulario.proyector,
        camara: formulario.camara,
        enchufes: formulario.enchufes,
      });

      if (arr.length > 0 && !arr.some((a) => a.nombre === formulario.nombre_aula)) {
        const aulaActualSigueDisponible = arr.some((a) => a.nombre === formulario.nombre_aula);
        if (!aulaActualSigueDisponible) {
          aplicarCambios({ 
            id_aula: arr[0].id, 
            nombre_aula: arr[0].nombre 
          });
        }
      }

      if (arr.length === 0) setMensaje("No hay aulas candidatas para esos criterios.");
    } catch (e) {
      console.error(e);
      setErrores(e?.data || { general: "Error al buscar aulas candidatas" });
      setAulasDisponibles([]);
    } finally {
      setBuscandoAulas(false);
    }
  };

  const guardar = async () => {
    setErrores(null);
    setMensaje(null);

    const parcial = {
      fecha: formulario.fecha,
      hora_inicio: formulario.hora_inicio,
      hora_fin: formulario.hora_fin,
      motivo: formulario.motivo,
      correo_responsable: formulario.correo_responsable,
      capacidad_solicitada:
        formulario.capacidad_solicitada === ""
          ? null
          : Number(formulario.capacidad_solicitada),
      num_ordenadores:
        formulario.num_ordenadores === "" ? null : Number(formulario.num_ordenadores),
      altavoces: formulario.altavoces,
      proyector: formulario.proyector,
      camara: formulario.camara,
      enchufes: formulario.enchufes,
      id_aula: formulario.id_aula,
      nombre_aula: formulario.nombre_aula,
      estado: formulario.estado,
    };

    try {
      const res = await patchReserva(formulario.idreserva, parcial);
      setMensaje(res?.message || "Cambios guardados correctamente");

      if (onFinish) {
        // Esperamos 1 segundo para que el usuario lea el mensaje verde
        setTimeout(() => {
          onFinish();
        }, 1000);
        return; // Salimos de la función para no vaciar el formulario inútilmente
      }

      setFormularioInicial((prev) => ({ ...prev, ...formulario }));
    } catch (e) {
      console.error(e);
      setErrores(e?.data || { general: "Error al guardar cambios" });
    }
  };

  const pedirAprobar = () => {
    setTipoConfirmacion("aprobar");
    setConfirmacionAbierta(true);
  };

  const pedirRechazar = () => {
    setTipoConfirmacion("rechazar");
    setConfirmacionAbierta(true);
  };

  const pedirEliminar = () => {
    setTipoConfirmacion("eliminar");
    setConfirmacionAbierta(true);
  };

  const confirmarCambioEstado = async () => {
    setConfirmacionAbierta(false);
    setErrores(null);
    setMensaje(null);

    try {
      if (tipoConfirmacion === "aprobar") {
        const res = await aprobarReserva(formulario.idreserva);
        setMensaje(res?.message || "Reserva aprobada");
      } else if (tipoConfirmacion === "rechazar") {
        const res = await rechazarReserva(formulario.idreserva);
        setMensaje(res?.message || "Reserva rechazada");
      } else if (tipoConfirmacion === "eliminar") {
        const res = await eliminarReserva(formulario.idreserva);
        setMensaje(res?.message || "Reserva eliminada correctamente");
      }

      if (onFinish) {
        setTimeout(() => {
          onFinish();
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setErrores(e?.data || { general: "Error al cambiar el estado" });
    } finally {
      setTipoConfirmacion(null);
    }
  };

  const tituloConfirmacion =
    tipoConfirmacion === "aprobar" ? "¿Aceptar solicitud?" : 
    tipoConfirmacion === "rechazar" ? "¿Rechazar solicitud?" : 
    "¿Eliminar reserva?";

  const descripcionConfirmacion =
    tipoConfirmacion === "aprobar"
      ? "Vas a aprobar esta solicitud. El estado cambiará a Aprobada."
      : tipoConfirmacion === "rechazar"
      ? "Vas a rechazar esta solicitud. El estado cambiará a Rechazada."
      : "Vas a eliminar esta reserva permanentemente. Esta acción no se puede deshacer.";

  return {
    cargando,
    errorCarga,

    formulario,
    aplicarCambios,

    aulasDisponibles,
    buscandoAulas,
    puedeBuscarAulas,
    buscarAulas,
    recursosModificados,

    puedeGuardar,
    hayCambios,
    guardar,

    mensaje,
    errores,

    pedirAprobar,
    pedirRechazar,
    pedirEliminar,

    modal: {
      abierto: confirmacionAbierta,
      setAbierto: setConfirmacionAbierta,
      titulo: tituloConfirmacion,
      descripcion: descripcionConfirmacion,
      textoConfirmar: tipoConfirmacion === "aprobar" ? "Aceptar" : "Rechazar",
      peligro: tipoConfirmacion === "rechazar"|| tipoConfirmacion === "eliminar",
      alConfirmar: confirmarCambioEstado,
    },
  };
}
