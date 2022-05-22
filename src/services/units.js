export const UNITS = {
  piece: { factor: 1 },
  kg: { factor: 1, child: 'g' },
  g: { factor: 1 / 1000, parent: 'kg' },
  L: { factor: 1, child: 'mL' },
  mL: { factor: 1 / 1000, parent: 'L' },
}

export function unitFactor(unit) {
  return unit ? UNITS[unit].factor || 1 : 1
}

export function unitParent(unit) {
  return UNITS[unit] ? UNITS[unit].parent || unit : unit
}

export function unitChild(unit) {
  return UNITS[unit] ? UNITS[unit].child || unit : unit
}
