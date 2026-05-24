import { useNavigate } from "react-router-dom";

export default function BotonLogout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');

        navigate("/");
    };

    return (
        <button onClick={handleLogout} className="bg-[#651818] hover:bg-[#4a1212] text-white py-2 px-4 rounded-md">
            Cerrar Sesión
        </button>
    );
}