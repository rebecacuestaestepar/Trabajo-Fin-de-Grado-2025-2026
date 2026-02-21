// src/aulas/utils/coloresAulas.js

/**
 * Recibe un array de aulas y genera un mapa de colores garantizando
 * la máxima separación visual entre ellas usando el Ángulo Áureo.
 */
export function generarMapaColores(aulasNombres = []) {
  const mapa = {};
  
  // Ordenamos alfabéticamente para que los colores sean consistentes
  // sin importar el orden en el que se seleccionaron
  const aulasOrdenadas = [...aulasNombres].sort();

  // El Ángulo Áureo (~137.5 grados) asegura que los colores no se pisen en la rueda HSL
  const goldenAngle = 137.508;

  aulasOrdenadas.forEach((aula, index) => {
    // Calculamos el matiz (hue)
    const hue = Math.round((index * goldenAngle) % 360);

    mapa[aula] = {
      oscuro: `hsl(${hue}, 70%, 40%)`, // 40% de luminosidad (oscuro para puntuales)
      claro: `hsl(${hue}, 70%, 80%)`,  // 80% de luminosidad (claro para periódicas)
    };
  });

  return mapa;
}