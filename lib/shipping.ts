// Mercado Livre shipping costs (Envios ML) - March 2026
// Source: Official ML table provided by user
// 29 weight rows × 8 price columns

// Price column boundaries (exclusive upper bounds)
// Col 0: R$0–18.99, Col 1: R$19–48.99, Col 2: R$49–78.99
// Col 3: R$79–99.99, Col 4: R$100–119.99, Col 5: R$120–149.99
// Col 6: R$150–199.99, Col 7: R$200+

interface FreteRow {
  maxKg: number // exclusive upper bound (-1 = infinity)
  costs: [number, number, number, number, number, number, number, number]
}

// prettier-ignore
const ML_FRETE_TABLE: FreteRow[] = [
  { maxKg: 0.3,  costs: [ 5.65,  6.55,  7.75, 12.35, 14.35, 16.45, 18.45, 20.95] },
  { maxKg: 0.5,  costs: [ 5.95,  6.65,  7.85, 13.25, 15.45, 17.65, 19.85, 22.55] },
  { maxKg: 1,    costs: [ 6.05,  6.75,  7.95, 13.85, 16.15, 18.45, 20.75, 23.65] },
  { maxKg: 1.5,  costs: [ 6.15,  6.85,  8.05, 14.15, 16.45, 18.85, 21.15, 24.65] },
  { maxKg: 2,    costs: [ 6.25,  6.95,  8.15, 14.45, 16.85, 19.25, 21.65, 24.65] },
  { maxKg: 3,    costs: [ 6.35,  7.95,  8.55, 15.75, 18.35, 21.05, 23.65, 26.25] },
  { maxKg: 4,    costs: [ 6.45,  8.15,  8.95, 17.05, 19.85, 22.65, 25.55, 28.35] },
  { maxKg: 5,    costs: [ 6.55,  8.35,  9.75, 18.45, 21.55, 24.65, 27.75, 30.75] },
  { maxKg: 6,    costs: [ 6.65,  8.55,  9.95, 25.45, 28.55, 32.65, 35.75, 39.75] },
  { maxKg: 7,    costs: [ 6.75,  8.75, 10.15, 27.05, 31.05, 36.05, 40.05, 44.05] },
  { maxKg: 8,    costs: [ 6.85,  8.95, 10.35, 28.85, 33.65, 38.45, 43.25, 48.05] },
  { maxKg: 9,    costs: [ 6.95,  9.15, 10.55, 29.65, 34.55, 39.55, 44.45, 49.35] },
  { maxKg: 11,   costs: [ 7.05,  9.55, 10.95, 41.25, 48.05, 54.95, 61.75, 68.65] },
  { maxKg: 13,   costs: [ 7.15,  9.95, 11.35, 42.15, 49.25, 56.25, 63.25, 70.25] },
  { maxKg: 15,   costs: [ 7.25, 10.15, 11.55, 45.05, 52.45, 59.95, 67.45, 74.95] },
  { maxKg: 17,   costs: [ 7.35, 10.35, 11.75, 48.55, 56.05, 63.55, 70.75, 78.65] },
  { maxKg: 20,   costs: [ 7.45, 10.55, 11.95, 54.75, 63.85, 72.95, 82.05, 91.15] },
  { maxKg: 25,   costs: [ 7.65, 10.95, 12.15, 64.05, 75.05, 84.75, 95.35,105.95] },
  { maxKg: 30,   costs: [ 7.75, 11.15, 12.35, 65.95, 75.45, 85.55, 96.25,106.95] },
  { maxKg: 40,   costs: [ 7.85, 11.35, 12.55, 67.75, 78.95, 88.95, 99.15,107.05] },
  { maxKg: 50,   costs: [ 7.95, 11.55, 12.75, 70.25, 81.05, 92.05,102.55,110.75] },
  { maxKg: 60,   costs: [ 8.05, 11.75, 12.95, 74.95, 86.45, 98.15,109.35,118.15] },
  { maxKg: 70,   costs: [ 8.15, 11.95, 13.15, 80.25, 92.95,105.05,117.15,126.55] },
  { maxKg: 80,   costs: [ 8.25, 12.15, 13.35, 83.95, 97.05,109.85,122.45,132.25] },
  { maxKg: 90,   costs: [ 8.35, 12.35, 13.55, 93.25,107.45,122.05,136.05,146.95] },
  { maxKg: 100,  costs: [ 8.45, 12.55, 13.75,106.55,123.95,139.55,155.55,167.95] },
  { maxKg: 125,  costs: [ 8.55, 12.75, 13.95,119.25,138.05,156.05,173.95,187.95] },
  { maxKg: 150,  costs: [ 8.65, 12.75, 14.15,126.55,146.15,165.65,184.65,199.45] },
  { maxKg: -1,   costs: [ 8.75, 12.95, 14.35,166.15,192.45,217.55,242.55,261.95] },
]

// Frete rápido: optional faster shipping for products < R$79
// Same values as col3 (R$79-99.99) of the main table
// prettier-ignore
const ML_FRETE_RAPIDO: number[] = [
  12.35, 13.25, 13.85, 14.15, 14.45, 15.75, 17.05, 18.45,
  25.45, 27.05, 28.85, 29.65, 41.25, 42.15, 45.05, 48.55,
  54.75, 64.05, 65.95, 67.75, 70.25, 74.95, 80.25, 83.95,
  93.25, 106.55, 119.25, 126.55, 166.15,
]

function findWeightRowIndex(weightKg: number): number {
  for (let i = 0; i < ML_FRETE_TABLE.length; i++) {
    const row = ML_FRETE_TABLE[i]
    if (row.maxKg === -1 || weightKg <= row.maxKg) return i
  }
  return ML_FRETE_TABLE.length - 1
}

function getPriceColumn(salePrice: number): number {
  if (salePrice < 19) return 0
  if (salePrice < 49) return 1
  if (salePrice < 79) return 2
  if (salePrice < 100) return 3
  if (salePrice < 120) return 4
  if (salePrice < 150) return 5
  if (salePrice < 200) return 6
  return 7
}

export interface MLShippingResult {
  cost: number
  type: 'padrao' | 'rapido' | 'manual'
  description: string
}

/**
 * Calculate ML shipping cost based on official March 2026 table
 *
 * Rules:
 * - Product < R$19: col0, capped at 50% of product price
 * - Product R$19–78.99: col1/col2 (standard), or frete rápido (optional)
 * - Product ≥ R$79: col3–col7 based on price (frete rápido included)
 */
export function calculateMLShipping(
  weightKg: number,
  salePrice: number,
  freteRapido: boolean
): MLShippingResult {
  if (weightKg <= 0 || salePrice <= 0) {
    return { cost: 0, type: 'padrao', description: 'Sem peso ou preço' }
  }

  const rowIndex = findWeightRowIndex(weightKg)
  const row = ML_FRETE_TABLE[rowIndex]

  // Products < R$19: col0, capped at 50% of sale price
  if (salePrice < 19) {
    const baseCost = row.costs[0]
    const cost = Math.min(baseCost, salePrice * 0.5)
    return {
      cost,
      type: 'padrao',
      description: cost < baseCost
        ? `Frete limitado a 50% do preço (R$${baseCost.toFixed(2).replace('.', ',')} → R$${cost.toFixed(2).replace('.', ',')})`
        : 'Frete padrão',
    }
  }

  // Products R$19–78.99: standard (col1/col2) or frete rápido (optional)
  if (salePrice < 79) {
    if (freteRapido) {
      return {
        cost: ML_FRETE_RAPIDO[rowIndex],
        type: 'rapido',
        description: 'Frete grátis rápido (opcional)',
      }
    }
    const col = getPriceColumn(salePrice)
    return {
      cost: row.costs[col],
      type: 'padrao',
      description: 'Frete grátis padrão',
    }
  }

  // Products ≥ R$79: use price-based column (frete rápido included automatically)
  const col = getPriceColumn(salePrice)
  return {
    cost: row.costs[col],
    type: 'rapido',
    description: 'Frete grátis rápido (automático)',
  }
}
