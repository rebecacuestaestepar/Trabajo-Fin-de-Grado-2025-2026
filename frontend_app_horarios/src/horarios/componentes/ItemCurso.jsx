const ItemCurso = ({ idCurso, enviarBack }) => {
    const [expandido, setExpandido] = React.useState(false);

    return (
        <div className="border-b border-slate-200 py-5 px-4 transition-colors duration-200 hover:bg-slate-50 last:border-b-0">
            <div
                className={`flex justify-between items-center cursor-pointer text-slate-800 ${
                    expandido ? 'font-bold' : 'font-normal'
                }`}
                onClick={() => setExpandido(!expandido)}
            >
                <span className="text-lg">Curso {idCurso}</span>
                    <span className="text-slate-400 transition-transform duration-200">
                        {expandido ? '▲' : '▼'}
                    </span>
            </div>

        </div>
    );
};

export default ItemCurso;