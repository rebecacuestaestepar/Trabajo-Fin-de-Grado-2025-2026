// src/aulas/utils/coloresAulas.js

/**
 * Recibe un array de aulas y genera un mapa de colores garantizando
 * la máxima separación visual entre ellas usando el Ángulo Áureo.
 */
export function generarMapaColores(aulas = []) {
  const mapa = {};


  // El Ángulo Áureo (~137.5 grados) asegura que los colores no se pisen en la rueda HSL
  const goldenAngle = 137.508;

  aulas.forEach((aula, index) => {
    // Calculamos el matiz (hue)
    if (!aula || aula.id == null || !aula.nombre) return; // Saltar si el aula no es válido
    const hue = Math.round((aula.id * goldenAngle) % 360);

    mapa[aula.nombre] = {
      oscuro: `hsl(${hue}, 70%, 40%)`, // 40% de luminosidad (oscuro para puntuales)
      claro: `hsl(${hue}, 70%, 80%)`,  // 80% de luminosidad (claro para periódicas)
    };
  });

  return mapa;
}