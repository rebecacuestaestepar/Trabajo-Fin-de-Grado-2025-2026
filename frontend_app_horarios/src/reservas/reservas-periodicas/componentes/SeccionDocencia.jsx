import { Campo } from "../../formulario-componentes/ui/Campo";
import { Selector } from "../../formulario-componentes/ui/Inputs";

export default function SeccionDocencia({ formulario, listas, alCambiar, soloLectura }) {
    return (
        <div className="space-y-4 pb-6 border-b border-slate-200">
            <Campo etiqueta="Grado">
                <Selector name="grado" value={formulario.grado || ""} onChange={alCambiar} disabled={soloLectura} required>
                    <option value="">Seleccione un grado...</option>
                    {listas.grados?.map(g => (
                        <option key={g.idgrado} value={g.idgrado}>{g.nombre}</option>
                    ))}
                </Selector>
            </Campo>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo etiqueta="Curso">
                    <Selector name="curso" value={formulario.curso || ""} onChange={alCambiar} disabled={!formulario.grado || soloLectura} required>
                        <option value="">Seleccione curso...</option>
                        {listas.cursos?.map(c => <option key={c} value={c}>{c}º</option>)}
                    </Selector>
                </Campo>

                <Campo etiqueta="Semestre">
                    <Selector name="semestre" value={formulario.semestre || ""} onChange={alCambiar} disabled={!formulario.curso || soloLectura} required>
                        <option value="">Seleccione semestre...</option>
                        {listas.semestres?.map(s => <option key={s} value={s}>{s}º Semestre</option>)}
                    </Selector>
                </Campo>
            </div>

            <Campo etiqueta="Asignatura">
                <Selector name="asignatura" value={formulario.asignatura || ""} onChange={alCambiar} disabled={!formulario.semestre || soloLectura} required>
                    <option value="">Seleccione asignatura...</option>
                    {listas.asignaturas?.map(a => <option key={a.idasignatura} value={a.idasignatura}>{a.nombre}</option>)}
                </Selector>
            </Campo>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo etiqueta="Grupo">
                    <Selector name="grupo" value={formulario.grupo || ""} onChange={alCambiar} disabled={!formulario.asignatura || soloLectura} required>
                        <option value="">Seleccione grupo...</option>
                        {listas.grupos?.map(g => <option key={g.grupoid} value={g.grupoid}>{g.nombre}</option>)}
                    </Selector>
                </Campo>
            </div>
        </div>
    );
}