export function obtenerColorGrupo(idGrupo) {
    if (idGrupo === 1) return { color: "#F5DBB5", tipo: "TEORIA", texto: "#1e293b" };
    if (idGrupo === 2) return { color: "#EDEBEB", tipo: "TEORIA", texto: "#1e293b" };
    if (idGrupo === 80) return { color: "#C191EB", tipo: "TEORIA", texto: "#1e293b" };
    if (/^10[1-9]$/.test(idGrupo)) return { color: "#B7EBF7", tipo: "PRACTICA", texto: "#1e293b" };
    if (/^20[1-9]$/.test(idGrupo)) return { color: "#EEFA39", tipo: "PRACTICA", texto: "#1e293b" };
    if (idGrupo === "801") return { color: "#8BC787", tipo: "PRACTICA", texto: "#1e293b" };
    return { color: "#f8fafc", tipo: "TEORIA", texto: "#1e293b" };
}