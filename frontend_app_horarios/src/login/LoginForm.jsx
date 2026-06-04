import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import logoUbu from "../assets/logoUbu.jpg";

export default function LoginForm() {
    const navigate = useNavigate();
    const location  = useLocation();

    const params = new URLSearchParams(location.search);
    const sesionExpirada = params.get("motivo") === "expirado";

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
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credenciales),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('token', data.access);
                sessionStorage.setItem('refresh', data.refresh);
                sessionStorage.setItem('username', data.usuario.username);
                sessionStorage.setItem('nombre', data.usuario.nombre);
                sessionStorage.setItem('apellidos', data.usuario.apellidos);

                sessionStorage.setItem('roles', JSON.stringify(data.usuario.roles || []));
                sessionStorage.setItem('permisos', JSON.stringify(data.usuario.permisos || []));
                console.log("Sesión inciada correctamente:", data);

                navigate("/reservas/gestion");
            } else {
                setError(data.detail || "Error al iniciar sesión.");
            }
            
            console.log("Enviando credenciales:", credenciales);

        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            setError("El usuario o la contraseña son incorrectos.");
        } finally {
            setCargando(false);
        }
    };


    return (

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-3">
                <img 
                    src={logoUbu} 
                    alt="Logo Universidad de Burgos" 
                    className="h-20 w-auto object-contain"
                />
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Herramienta de gestión de la EPS
                    </h1>
                </div>
            </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-6 rounded-lg shadow-md w-full max-w-sm">

        {sesionExpirada && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md border border-red-200">
            Tu sesión ha expirado. Por favor, inicia sesión de nuevo.
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm font-medium text-gray-700">
            Nombre de usuario
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={credenciales.username}
            onChange={handleChange}
            disabled={cargando}
            className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
            placeholder=""
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={credenciales.password}
            onChange={handleChange}
            disabled={cargando}
            className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
            placeholder=""
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="mt-2 w-full py-2.5 px-4 bg-[#7a1e1e] text-white font-semibold rounded-lg shadow-sm hover:bg-[#7a1e1e] focus:outline-none focus:ring-2 focus:ring-[#7a1e1e] focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );


}