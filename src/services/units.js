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
  if (unitConfig.parent && value * unitConfig.factor > 1) {
    return { unit: unitParent(unit), value: value * unitConfig.factor }
  }
  return { unit, value }
}

export function canConvertToPiece(product = {}) {
  return product.unit === 'piece' || !!(product.packaging_convert_to_piece && product.packaging_conditioning)
}

export function canUsePiecePrice(product = {}) {
  return product.unit !== 'piece' && !!(product.packaging_convert_to_piece && product.packaging_conditioning)
}

export function normalizePriceInputUnit(priceInputUnit, product = {}) {
  if (priceInputUnit === 'piece' && canUsePiecePrice(product)) return 'piece'
  return 'base'
}

export function convertPriceToBaseUnit(price, priceInputUnit, product = {}) {
  if (price == null || price === '') return price

  if (normalizePriceInputUnit(priceInputUnit, product) === 'piece') {
    return Number(price) / Number(product.packaging_conditioning)
  }

  return Number(price)
}

export function convertPriceFromBaseUnit(price, priceInputUnit, product = {}) {
  if (price == null || price === '') return price

  if (normalizePriceInputUnit(priceInputUnit, product) === 'piece') {
    return Number(price) * Number(product.packaging_conditioning)
  }

  return Number(price)
}

export function casePackFactor(product = {}) {
  if (!(product.case_pack_size > 1)) return null
  if (product.packaging_conditioning) return product.case_pack_size * product.packaging_conditioning
  if (product.unit === 'piece') return product.case_pack_size
  return null
}

export function canUseCasePack(product = {}) {
  return !!casePackFactor(product)
}

export function convertToUnit(value, fromUnit, product) {
  const toUnit = product.unit

  if (fromUnit == 'case' && canUseCasePack(product)) {
    return value * casePackFactor(product)
  }

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
