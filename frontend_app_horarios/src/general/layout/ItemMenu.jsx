import { NavLink } from "react-router-dom";

export default function ItemMenu({ a, children }) {
  return (
    <NavLink
      to={a}
      className={({ isActive }) =>
        [
          "block px-4 py-3 text-sm font-semibold uppercase",
          isActive ? "bg-[#651818]" : "hover:bg-[#651818]",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
