import { useState, useEffect } from "react";
import { 
    obtenerGrados, obtenerCursosGrado, obtenerSemestresPorGradoCurso, 
    obtenerAsignaturasPorGradoCursoSemestre, obtenerGruposAsignatura, 
    obtenerAulasLibres, crearReservaPeriodica 
} from "../../../api/docencia";

export function useReservaPeriodica({ modo = 'crear', datosIniciales = {} }) {
    const esModoVer = modo === 'ver';

    const [formulario, setFormulario] = useState({
        grado: datosIniciales.grado || '',
        curso: datosIniciales.curso || '',
        semestre: datosIniciales.semestre || '',
        asignatura: datosIniciales.asignatura || '',
        grupo: datosIniciales.grupo || '',
        tipoClase: datosIniciales.tipoClase || '',
        diaSemana: datosIniciales.diaSemana || '',
        horaInicio: datosIniciales.horaInicio || '',
        horaFin: datosIniciales.horaFin || ''
    });

    const [listas, setListas] = useState({
        grados: [], cursos: [], semestres: [], asignaturas: [], grupos: []
    });

    const [modoSeleccionAula, setModoSeleccionAula] = useState('comun');
    const [buscandoAulas, setBuscandoAulas] = useState(false);
    const [aulasDisponibles, setAulasDisponibles] = useState([]);
    const [aulaSeleccionada, setAulaSeleccionada] = useState('');

    const [exito, setExito] = useState(null);
    const [errores, setErrores] = useState(null);

    useEffect(() => {
        obtenerGrados().then(data => setListas(p => ({...p, grados: data.grados || []})));
    }, []);

    useEffect(() => {
        if (formulario.grado && formulario.grado !== 'undefined' && formulario.grado !== '') {
            obtenerCursosGrado(formulario.grado)
                .then(data => setListas(p => ({ ...p, cursos: data.cursos || [] })))
                .catch(err => console.error("Error cargando cursos:", err));
        }
    }, [formulario.grado]);

    useEffect(() => {
        if (formulario.grado && formulario.curso && formulario.curso !== 'undefined') {
            obtenerSemestresPorGradoCurso(formulario.grado, formulario.curso)
                .then(data => setListas(p => ({ ...p, semestres: data.semestres || [] })))
                .catch(err => console.error("Error cargando semestres:", err));
        }
    }, [formulario.grado, formulario.curso]);

    useEffect(() => {
        if (formulario.grado && formulario.curso && formulario.semestre && formulario.semestre !== 'undefined') {
            obtenerAsignaturasPorGradoCursoSemestre(formulario.grado, formulario.curso, formulario.semestre)
                .then(data => setListas(p => ({ ...p, asignaturas: data.asignaturas || [] })))
                .catch(err => console.error("Error cargando asignaturas:", err));
        }
    }, [formulario.grado, formulario.curso, formulario.semestre]);


    useEffect(() => {
        if (formulario.asignatura && formulario.asignatura !== 'undefined') {
            obtenerGruposAsignatura(formulario.asignatura)
                .then(data => setListas(p => ({ ...p, grupos: data.grupos || [] })))
                .catch(err => console.error("Error cargando grupos:", err));
        }
    }, [formulario.asignatura]);


    const aplicarCambios = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => {
            const nuevo = { ...prev, [name]: value };
            if (name === 'grado') { 
                nuevo.curso = ''; nuevo.semestre = ''; nuevo.asignatura = ''; nuevo.grupo = ''; 
            } else if (name === 'curso') {
                nuevo.semestre = ''; nuevo.asignatura = ''; nuevo.grupo = '';
            } else if (name === 'semestre') {
                nuevo.asignatura = ''; nuevo.grupo = '';
            } else if (name === 'asignatura') {
                nuevo.grupo = '';
            }
            return nuevo;
        });

        setListas(prev => {
            const nuevasListas = { ...prev };
            if (name === 'grado') {
                nuevasListas.cursos = []; nuevasListas.semestres = []; nuevasListas.asignaturas = []; nuevasListas.grupos = [];
            } else if (name === 'curso') {
                nuevasListas.semestres = []; nuevasListas.asignaturas = []; nuevasListas.grupos = [];
            } else if (name === 'semestre') {
                nuevasListas.asignaturas = []; nuevasListas.grupos = [];
            } else if (name === 'asignatura') {
                nuevasListas.grupos = [];
            }
            return nuevasListas;
        });

        if (['diaSemana', 'horaInicio', 'horaFin'].includes(name)) {
            setAulasDisponibles([]); 
            setAulaSeleccionada('');
        }
    };

    const buscarAulas = () => {
        console.log("1. ¡Botón de buscar pulsado!");
        console.log("2. Enviando datos al endpoint:", {
            diaSemana: formulario.diaSemana,
            horaInicio: formulario.horaInicio,
            horaFin: formulario.horaFin
        });
        setBuscandoAulas(true);
        setExito(null);
        setErrores(null);

        obtenerAulasLibres({
            diaSemana: formulario.diaSemana, horaInicio: formulario.horaInicio, horaFin: formulario.horaFin
        }).then(data => {
            console.log("Aulas libres recibidas:", data);
            const aulas = data.aulas_libres || [];
            setAulasDisponibles(aulas);
            setAulaSeleccionada(aulas.length > 0 ? aulas[0].nombre : '');
            setModoSeleccionAula('comun');
        }).finally(() => setBuscandoAulas(false));
    };

    const puedeBuscarAulas = formulario.diaSemana && formulario.horaInicio && formulario.horaFin && formulario.diaSemana !== '' && formulario.horaInicio !== '' && formulario.horaFin !== '';
    const puedeEnviar = aulaSeleccionada !== '';

    const enviarFormulario = (e) => {
        e.preventDefault();
        
        const payload = {
            id_curso: formulario.curso,
            semestre_num: formulario.semestre,
            datos_reserva: {
                dia_semana: parseInt(formulario.diaSemana),
                id_grupo: formulario.grupo,
                id_aula: aulaSeleccionada,
                hora_inicio: formulario.horaInicio,
                hora_fin: formulario.horaFin
            }
        };

        crearReservaPeriodica(payload)
            .then(() => {
                setExito("Reserva periódica creada correctamente.");
                setErrores(null);
            })
            .catch(err => {
                setErrores(err); 
                setExito(null);
            });
    };

    return {
        formulario, aplicarCambios, listas,
        modoSeleccionAula, buscandoAulas, aulasDisponibles, aulaSeleccionada,
        setAulaSeleccionada, buscarAulas, puedeBuscarAulas, puedeEnviar,
        enviarFormulario, exito, errores, esModoVer
    };
}