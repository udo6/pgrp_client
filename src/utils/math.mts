import alt from 'alt-client';

export const distanceTo = (v1: alt.Vector3, v2: alt.Vector3, useZ: boolean): number => {
  const dist = Math.sqrt((v1.x - v2.x)*(v1.x - v2.x) + (v1.y - v2.y)*(v1.y - v2.y) + (useZ ? (v1.z - v2.z)*(v1.z - v2.z) : 0));
  return dist < 0 ? dist * -1 : dist;
}

export const distanceTo2 = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number => {
  const dist = Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2) + (z1 - z2)*(z1 - z2));
  return dist < 0 ? dist * -1 : dist;
}

export const distanceTo2D = (x1: number, y1: number, x2: number, y2: number): number => {
  const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return dist < 0 ? dist * -1 : dist;
}