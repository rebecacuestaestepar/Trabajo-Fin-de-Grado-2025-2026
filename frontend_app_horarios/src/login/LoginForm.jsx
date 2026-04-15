import { useState } from "react";
import { useNavigate } from "react-router-dom"; 

export default function LoginForm() {
    const navigate = useNavigate();
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
                //localStorage.setItem('token', data.token);
                //localStorage.setItem('username', data.usuario);
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

    // return (
    //     <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded shadow">
    //         <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
    //         {error && <div className="mb-4 text-red-600">{error}</div>}
    //         <div className="mb-4">
    //             <label htmlFor="username" className="block text-sm font-medium mb-1">Usuario</label>
    //             <input
    //                 type="text"
    //                 id="username"
    //                 name="username"
    //                 value={credenciales.username}
    //                 onChange={handleChange}
    //                 className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //                 disabled={cargando}
    //             />
    //         </div>
    //         <div className="mb-6">
    //             <label htmlFor="password" className="block text-sm font-medium mb-1">Contraseña</label>
    //             <input
    //                 type="password"
    //                 id="password"  
    //                 name="password"
    //                 value={credenciales.password}
    //                 onChange={handleChange}
    //                 className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    //                 disabled={cargando}
    //             />
    //         </div>

    //         <button
    //             type="submit"
    //             className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
    //             disabled={cargando}
    //         >
    //             {cargando ? "Iniciando..." : "Iniciar Sesión"}
    //         </button>
    //     </form>
    // );

    return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-6 rounded-lg shadow-md w-full max-w-sm">

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

      {/* Botón de Submit */}
      <button
        type="submit"
        disabled={cargando}
        className="mt-2 w-full py-2.5 px-4 bg-[#7a1e1e] text-white font-semibold rounded-lg shadow-sm hover:bg-[#7a1e1e] focus:outline-none focus:ring-2 focus:ring-[#7a1e1e] focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {/* {cargando ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Conectando...
          </span>
        ) : (
          'Iniciar Sesión'
        )} */}
        Iniciar Sesión
      </button>
    </form>
  );


}