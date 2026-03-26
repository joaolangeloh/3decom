// Amazon 3D marketplace fee configuration (2026)

export interface Amazon3DCategory {
  id: string
  name: string
  commissionPct: number
  commissionType: 'flat' | 'tiered'
  tier?: {
    threshold: number
    excessPct: number
  }
  minCommission: number
}

export const AMAZON_3D_CATEGORIES: Amazon3DCategory[] = [
  { id: 'casa_cozinha', name: 'Casa e Cozinha', commissionPct: 13, commissionType: 'flat', minCommission: 1 },
  { id: 'ferramentas', name: 'Ferramentas e Melhoria da Casa', commissionPct: 15, commissionType: 'flat', minCommission: 1 },
  { id: 'brinquedos', name: 'Brinquedos e Jogos', commissionPct: 15, commissionType: 'flat', minCommission: 1 },
  { id: 'escritorio', name: 'Escritório e Papelaria', commissionPct: 15, commissionType: 'flat', minCommission: 1 },
  { id: 'eletronicos', name: 'Eletrônicos', commissionPct: 12, commissionType: 'flat', minCommission: 1 },
  { id: 'esportes', name: 'Esportes e Aventura', commissionPct: 13, commissionType: 'flat', minCommission: 1 },
  { id: 'automotivo', name: 'Automotivo', commissionPct: 12, commissionType: 'flat', minCommission: 1 },
  { id: 'jardim', name: 'Jardim e Piscina', commissionPct: 15, commissionType: 'flat', minCommission: 1 },
  { id: 'pet', name: 'Pet Shop', commissionPct: 15, commissionType: 'flat', minCommission: 1 },
  { id: 'outros', name: 'Outros', commissionPct: 15, commissionType: 'flat', minCommission: 1 },
]

export interface AmazonFBAFeeTier {
  minPrice: number
  maxPrice: number
  logisticsFee: number
  collectionFee: number
  storageFee: number
}

// FBA fees by sale price range (R$)
export const AMAZON_FBA_FEE_TABLE: AmazonFBAFeeTier[] = [
  { minPrice: 0, maxPrice: 20, logisticsFee: 5.50, collectionFee: 1.00, storageFee: 0.50 },
  { minPrice: 20, maxPrice: 50, logisticsFee: 6.50, collectionFee: 1.50, storageFee: 0.75 },
  { minPrice: 50, maxPrice: 100, logisticsFee: 7.50, collectionFee: 2.00, storageFee: 1.00 },
  { minPrice: 100, maxPrice: 200, logisticsFee: 9.00, collectionFee: 2.50, storageFee: 1.25 },
  { minPrice: 200, maxPrice: 500, logisticsFee: 11.00, collectionFee: 3.00, storageFee: 1.50 },
  { minPrice: 500, maxPrice: Infinity, logisticsFee: 14.00, collectionFee: 4.00, storageFee: 2.00 },
]

// Installment fee: additional percentage on products above minimum price
export const AMAZON_INSTALLMENT_FEE_PCT = 3.5
export const AMAZON_INSTALLMENT_MIN_PRICE = 50

// DBA flat shipping fee
export const AMAZON_DBA_SHIPPING_FEE = 6.90

export function getAmazonFBAFee(salePrice: number): number {
  const tier = AMAZON_FBA_FEE_TABLE.find(
    (t) => salePrice >= t.minPrice && salePrice < t.maxPrice
  ) ?? AMAZON_FBA_FEE_TABLE[AMAZON_FBA_FEE_TABLE.length - 1]
  return tier.logisticsFee + tier.collectionFee + tier.storageFee
}

export function getAmazonCommission(
  salePrice: number,
  categoryId: string
): number {
  const cat = AMAZON_3D_CATEGORIES.find((c) => c.id === categoryId) ??
    AMAZON_3D_CATEGORIES[AMAZON_3D_CATEGORIES.length - 1]
  const commission = salePrice * (cat.commissionPct / 100)
  return Math.max(commission, cat.minCommission)
}

export function getAmazonInstallmentFee(
  salePrice: number,
  enabled: boolean
): number {
  if (!enabled || salePrice < AMAZON_INSTALLMENT_MIN_PRICE) return 0
  return salePrice * (AMAZON_INSTALLMENT_FEE_PCT / 100)
}
