import { NavLink } from "react-router-dom";

export default function ItemMenu({ a, children, level = 0 }) {

  const bgColors = ["bg-[#7a1e1e]", "bg-[#4a1212]", "bg-[#120000]"];
  const currentBg = bgColors[level] || bgColors.at(- 1);

  const paddingLeft = level === 0 ? "1rem" : `${level * 1.5}rem`;

  const tieneQueryParam = a.includes("?");

  return (
    <NavLink
      to={a}
      style={{ paddingLeft }}
      className={({ isActive }) => {
        const estaActivo = tieneQueryParam ? (location.pathname + location.search) === a : isActive;
        return [
          "block px-4 py-3 text-sm font-semibold uppercase transition-all duration-200",
          estaActivo 
          ? "bg-white text-black" 
          : `${currentBg} text-white hover:brightness-110`,
        ].join(" ")
      }}
    >
      {children}
    </NavLink>
  );
}
