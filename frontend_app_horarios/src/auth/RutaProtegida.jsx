import { Navigate, Outlet } from "react-router-dom";

export default function RutaProtegida() {
    const token = sessionStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}