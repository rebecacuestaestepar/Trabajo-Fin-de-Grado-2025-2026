export function Campo({ etiqueta, children, pista }) {
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
            <label className="text-sm font-medium text-slate-700 sm:col-span-4">
                {etiqueta}
            </label>

            <div className="sm:col-span-8">
                { children }
                { pista ? <p className="mt-1 text-xs text-slate-500">{pista}</p> : null }
            </div>
        </div>
    );
}