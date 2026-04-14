import { useState } from "react";

export default function LoginForm() {
    const [credenciales, setCredenciales] = useState({
        username: "",
        password: "",
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredenciales((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError("");

        if (!credenciales.username || !credenciales.password) {
            setError("Es obligatorio completar todos los campos.");
            setCargando(false);
            return;
        }

        try {
            console.log("Enviando credenciales:", credenciales);

        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            setError("El usuario o la contraseña son incorrectos.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-1">Usuario</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={credenciales.username}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={cargando}
                />
            </div>
            <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium mb-1">Contraseña</label>
                <input
                    type="password"
                    id="password"  
                    name="password"
                    value={credenciales.password}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={cargando}
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={cargando}
            >
                {cargando ? "Iniciando..." : "Iniciar Sesión"}
            </button>
        </form>
    );
}