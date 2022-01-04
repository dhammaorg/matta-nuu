export const UNITS = {
  piece: { factor: 1 },
  kg: { factor: 1 },
  g: { factor: 1 / 1000, parent: 'kg' },
  L: { factor: 1 },
  mL: { factor: 1 / 1000, parent: 'L' },
}

export function unitFactor(unit) {
  return unit ? UNITS[unit].factor || 1 : 1
}

export function unitParent(unit) {
  return UNITS[unit] ? UNITS[unit].parent || unit : unit
}
