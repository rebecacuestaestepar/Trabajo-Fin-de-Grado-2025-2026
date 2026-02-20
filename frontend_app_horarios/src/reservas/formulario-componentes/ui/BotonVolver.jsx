import { useLocation, useNavigate } from "react-router-dom";

export default function BotonVolver({
  fallback = "/reservas",
  className = "rounded-md px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50",
  children = "← Volver",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || fallback;

  return (
    <button type="button" onClick={() => navigate(from)} className={className}>
      {children}
    </button>
  );
}