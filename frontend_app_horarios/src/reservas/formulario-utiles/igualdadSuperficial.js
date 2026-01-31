export default function igualdadSuperficial(objA, objB) {
  if (objA === objB) return true;
  if (!objA || !objB) return false;

  const clavesA = Object.keys(objA);
  const clavesB = Object.keys(objB);

  if (clavesA.length !== clavesB.length) return false;

  for (const clave of clavesA) {
    if (objA[clave] !== objB[clave]) return false;
  }
  return true;
}