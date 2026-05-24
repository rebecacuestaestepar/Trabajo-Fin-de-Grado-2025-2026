export function obtenerColorGrupo(grupo) {
    if (grupo === "1") return { color: "#F5DBB5", tipo: "TEORIA", texto: "#1e293b" };
    if (grupo === "2") return { color: "#EDEBEB", tipo: "TEORIA", texto: "#1e293b" };
    if (grupo === "80") return { color: "#C191EB", tipo: "TEORIA", texto: "#1e293b" };
    if (/^10[1-9]$/.test(grupo)) return { color: "#B7EBF7", tipo: "PRACTICA", texto: "#1e293b" };
    if (/^20[1-9]$/.test(grupo)) return { color: "#EEFA39", tipo: "PRACTICA", texto: "#1e293b" };
    if (grupo === "801") return { color: "#8BC787", tipo: "PRACTICA", texto: "#1e293b" };
    return { color: "#f8fafc", tipo: "TEORIA", texto: "#1e293b" };
}