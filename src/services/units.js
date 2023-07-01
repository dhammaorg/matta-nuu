export const UNITS = {
  piece: { factor: 1 },
  kg: { factor: 1000, child: 'g' },
  g: { factor: 1 / 1000, parent: 'kg' },
  L: { factor: 1000, child: 'mL' },
  mL: { factor: 1 / 1000, parent: 'L' },
  oz: { factor: 1 / 16, parent: 'lb' },
  lb: { factor: 16, child: 'oz' },
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

export function convertToBestUnit(unit, value) {
  const unitConfig = UNITS[unit] || {}
  if (unitConfig.child && value < 1) {
    return { unit: unitChild(unit), value: value * unitConfig.factor }
  }
  if (unitConfig.parent && (value * unitConfig.factor > 1)) {
    return { unit: unitParent(unit), value: value * unitConfig.factor }
  }
  return { unit, value }
}

export function convertToUnit(value, fromUnit, product) {
  const toUnit = product.unit

  if (fromUnit == 'piece' && product.packaging_convert_to_piece && product.packaging_conditioning) {
    return value * product.packaging_conditioning
  }

  if (fromUnit == toUnit) return value

  if (unitChild(fromUnit) == toUnit || unitParent(fromUnit) == toUnit) {
    return value * unitFactor(fromUnit)
  }

  console.error(`Try to convert ${fromUnit} to ${toUnit} but that's not possible`, product)
  return null
}
