
/**
 * Recibe un array de aulas y genera un mapa de colores garantizando
 * la máxima separación visual entre ellas usando el Ángulo Áureo.
 */
export function generarMapaColores(aulas = []) {
  const mapa = {};


  // El Ángulo Áureo (137.5 grados) asegura que no se generen colore similares
  const goldenAngle = 137.508;

  aulas.forEach((aula) => {
    if (!aula || aula.id == null || !aula.nombre) return; // Saltamos si el aula no es válido
    const hue = Math.round((aula.id * goldenAngle) % 360);

    mapa[aula.nombre] = {
      oscuro: `hsl(${hue}, 70%, 40%)`, // 40% de luminosidad (oscuro para puntuales)
      claro: `hsl(${hue}, 70%, 80%)`,  // 80% de luminosidad (claro para periódicas)
    };
  });

  return mapa;
}