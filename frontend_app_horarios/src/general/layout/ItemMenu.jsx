import { NavLink } from "react-router-dom";

export default function ItemMenu({ a, children, level = 0 }) {

  /*const paddingLeft = `${level * 1}rem`;*/
  const paddingLeft = level === 0 ? "1rem" : `${level * 1.5 + 1}rem`;

  return (
    <NavLink
      to={a}
      style={{ paddingLeft }}
      className={({ isActive }) =>
        [
          "block px-4 py-3 text-sm font-semibold uppercase",
          isActive ? "bg-white text-black" : "hover:bg-[#651818]",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
