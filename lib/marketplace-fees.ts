// Mercado Livre category commission rates (2026)
// Source: doc 3DECOM + mercadolivre.com.br
// Pattern: Premium = Clássico + 5% always

export interface MLCategory {
  label: string
  classico: number // percentage
  premium: number // percentage
}

// Categories relevant for 3D printing / e-commerce sellers
export const ML_CATEGORIES: Record<string, MLCategory> = {
  casa_moveis: { label: 'Casa, Móveis e Decoração', classico: 12.5, premium: 17.5 },
  utilidades: { label: 'Utilidades Domésticas', classico: 12.5, premium: 17.5 },
  brinquedos: { label: 'Brinquedos e Hobbies', classico: 12.5, premium: 17.5 },
  festas: { label: 'Festas e Lembrancinhas', classico: 12, premium: 17 },
  ferramentas: { label: 'Ferramentas e Construção', classico: 12, premium: 17 },
  veiculos: { label: 'Acessórios para Veículos', classico: 11.5, premium: 16.5 },
  eletronicos: { label: 'Eletrônicos', classico: 11.5, premium: 16.5 },
  games: { label: 'Games', classico: 11, premium: 16 },
}

// Default category for 3D printing (Casa, Móveis e Decoração)
export const ML_DEFAULT_CATEGORY = 'casa_moveis'

// Mercado Livre fixed fee: R$0.49 per unit for products < R$12.50
// Source: doc 3DECOM
export function getMLFixedFee(salePrice: number): number {
  if (salePrice < 12.5) return 0.49
  return 0
}

// Shopee commission tiers (March 2026)
// Source: seller.shopee.com.br/edu/article/26839
export interface ShopeeTier {
  maxPrice: number // exclusive upper bound (Infinity for last)
  commissionPercent: number
  fixedFee: number
}

export const SHOPEE_TIERS: ShopeeTier[] = [
  { maxPrice: 80, commissionPercent: 20, fixedFee: 4 },
  { maxPrice: 100, commissionPercent: 14, fixedFee: 16 },
  { maxPrice: 200, commissionPercent: 14, fixedFee: 20 },
  { maxPrice: 500, commissionPercent: 14, fixedFee: 26 },
  { maxPrice: Infinity, commissionPercent: 14, fixedFee: 26 },
]

export const SHOPEE_COMMISSION_CAP = 100 // R$100 max commission per item
export const SHOPEE_CPF_SURCHARGE = 3 // R$3 extra per item for high-volume CPF
export const SHOPEE_CAMPAIGN_SURCHARGE = 2.5 // +2.5% during campaigns

export function getShopeeTier(salePrice: number): ShopeeTier {
  for (const tier of SHOPEE_TIERS) {
    if (salePrice < tier.maxPrice) return tier
  }
  return SHOPEE_TIERS[SHOPEE_TIERS.length - 1]
}

// Shopee special fixed fee rules for very low-price items
export function getShopeeFixedFee(salePrice: number, tier: ShopeeTier): number {
  if (salePrice < 8) return salePrice * 0.5
  if (salePrice < 12) return Math.min(tier.fixedFee, salePrice * 0.5)
  return tier.fixedFee
}
