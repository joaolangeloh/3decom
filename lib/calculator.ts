import {
  ML_CATEGORIES,
  ML_DEFAULT_CATEGORY,
  getMLFixedFee,
  getShopeeTier,
  getShopeeFixedFee,
  SHOPEE_COMMISSION_CAP,
  SHOPEE_CPF_SURCHARGE,
  SHOPEE_CAMPAIGN_SURCHARGE,
} from './marketplace-fees'
import { calculateMLShipping } from './shipping'
import { PRINTERS } from './printers'

// ============================================================
// Input types
// ============================================================

export interface MarketplaceConfig {
  type: 'none' | 'mercadolivre' | 'shopee'
  // ML
  mlAdType?: 'classico' | 'premium'
  mlParcelamento?: boolean // installments — only for premium, adds 2.99% anticipation fee
  mlCategory?: string
  mlCustomRate?: number // manual rate for "Outra categoria"
  // Shopee
  shopeeSellerType?: 'cpf' | 'cnpj'
  shopeeCpfHighVolume?: boolean
  shopeeCampaign?: boolean
  shopeeCouponType?: 'none' | 'percent' | 'fixed' // cupom proprio
  shopeeCouponValue?: number
}

export interface PricingMode {
  mode: 'sale-price' | 'margin' // user enters sale price OR desired margin
  salePrice?: number // when mode = 'sale-price'
  marginPercent?: number // when mode = 'margin'
}

export interface PromoConfig {
  enabled: boolean
  discountPercent: number // e.g. 10 for 10% off
}

export interface PaymentConfig {
  cardRatePercent: number // taxa do cartao (0 for Pix)
  pixDiscountPercent: number // desconto Pix sobre preco (ex: 5%)
}

export interface CalculationInput {
  // Product type
  productType: '3d' | 'normal'

  // Pricing
  pricing: PricingMode
  promo: PromoConfig
  payment: PaymentConfig

  // Marketplace
  marketplace: MarketplaceConfig

  // Shipping (ML only)
  shippingWeightKg: number
  mlFreteRapido: boolean
  manualShipping: number | null // null = auto-calculate

  // Printer & Energy (3D only)
  printerId: string
  customPrinterKw: number // used when printerId === 'custom'
  printHours: number
  printMinutes: number
  kwhPrice: number

  // Filament (3D only)
  filamentPricePerKg: number
  filamentWeightGrams: number

  // Supplier cost (normal product only)
  supplierCost: number

  // Other costs
  taxPercent: number
  packagingCost: number
  otherCosts: number

  // Production (venda direta only)
  laborCostPerHour: number
  laborMinutes: number
}

// ============================================================
// Result types
// ============================================================

export interface WaterfallLine {
  label: string
  value: number // amount deducted (positive = cost)
  percent: number // % of sale price
  remaining: number // balance after deduction
}

export interface CalculationResult {
  // The sale price (what buyer pays)
  salePrice: number

  // If promo enabled, the announced price (higher)
  announcedPrice: number
  promoDiscount: number

  // Pix price (with discount)
  pixPrice: number
  pixDiscount: number

  // Waterfall breakdown (from sale price down to profit)
  waterfall: WaterfallLine[]

  // Marketplace fees detail
  marketplaceCommissionPercent: number
  marketplaceCommission: number
  marketplaceFixedFee: number
  marketplaceCpfSurcharge: number
  marketplaceAnticipationFee: number
  marketplaceTotalFee: number

  // Shipping
  shippingCost: number
  shippingDescription: string

  // Cost components
  taxAmount: number
  cardFee: number
  energyCost: number
  filamentCost: number
  supplierCost: number
  packagingCost: number
  otherCosts: number
  laborCost: number

  // Totals
  totalCosts: number
  profit: number
  marginPercent: number
  profitPerHour: number

  // Capacity
  dailyProfit: number // 20h/day
  monthlyProfit: number // 30 days

  // Shopee cupom
  shopeeCouponCost: number
}

// ============================================================
// Main calculation
// ============================================================

export function calculate(input: CalculationInput): CalculationResult {
  // Determine sale price
  let salePrice: number
  if (input.pricing.mode === 'sale-price') {
    salePrice = input.pricing.salePrice || 0
  } else {
    // Margin mode: calculate sale price from costs + desired margin
    salePrice = calculateSalePriceFromMargin(input)
  }

  if (salePrice <= 0) return emptyResult()

  // Promo: announced price = salePrice / (1 - discount%)
  const promoDiscount = input.promo.enabled
    ? salePrice * (input.promo.discountPercent / 100) / (1 - input.promo.discountPercent / 100)
    : 0
  const announcedPrice = salePrice + promoDiscount

  // Pix price
  const pixDiscount = salePrice * (input.payment.pixDiscountPercent / 100)
  const pixPrice = salePrice - pixDiscount

  // ---- Calculate all costs/fees from the sale price ----

  // 1. Marketplace fees
  const mkp = calculateMarketplaceFees(salePrice, input.marketplace)

  // 2. Shipping
  let shippingCost = 0
  let shippingDescription = ''
  if (input.manualShipping !== null) {
    shippingCost = input.manualShipping
    shippingDescription = 'Frete manual'
  } else if (input.marketplace.type === 'mercadolivre') {
    const shipping = calculateMLShipping(
      input.shippingWeightKg,
      salePrice,
      input.mlFreteRapido
    )
    shippingCost = shipping.cost
    shippingDescription = shipping.description
  }
  // Shopee: frete = R$0 (ja embutido na taxa da plataforma)

  // 3. Shopee cupom proprio
  let shopeeCouponCost = 0
  if (
    input.marketplace.type === 'shopee' &&
    input.marketplace.shopeeCouponType &&
    input.marketplace.shopeeCouponType !== 'none'
  ) {
    const val = input.marketplace.shopeeCouponValue || 0
    if (input.marketplace.shopeeCouponType === 'percent') {
      shopeeCouponCost = salePrice * (val / 100)
    } else {
      shopeeCouponCost = val
    }
  }

  // 4. Tax (on sale price)
  const taxAmount = salePrice * (input.taxPercent / 100)

  // 5. Card fee (on sale price)
  const cardFee = salePrice * (input.payment.cardRatePercent / 100)

  // 6. Energy (3D only)
  let energyCost = 0
  let printTimeHours = 0
  if (input.productType === '3d') {
    const printer = PRINTERS.find((p) => p.id === input.printerId)
    const printerKw = input.printerId === 'custom' ? input.customPrinterKw : (printer?.avgKw || 0.08)
    printTimeHours = input.printHours + input.printMinutes / 60
    energyCost = printerKw * printTimeHours * input.kwhPrice
  }

  // 7. Filament (3D only)
  const filamentCost = input.productType === '3d'
    ? (input.filamentPricePerKg / 1000) * input.filamentWeightGrams
    : 0

  // 7b. Supplier cost (normal product only)
  const supplierCost = input.productType === 'normal' ? (input.supplierCost || 0) : 0

  // 8. Packaging
  const packagingCost = input.packagingCost

  // 9. Other costs
  const otherCosts = input.otherCosts

  // 10. Labor (venda direta)
  const laborCost =
    input.marketplace.type === 'none'
      ? input.laborCostPerHour * (input.laborMinutes / 60)
      : 0

  // Total deductions
  const totalCosts =
    mkp.totalFee +
    shippingCost +
    shopeeCouponCost +
    taxAmount +
    cardFee +
    energyCost +
    filamentCost +
    supplierCost +
    packagingCost +
    otherCosts +
    laborCost

  const profit = salePrice - totalCosts
  const marginPercent = salePrice > 0 ? (profit / salePrice) * 100 : 0
  const profitPerHour = printTimeHours > 0 ? profit / printTimeHours : 0

  // Capacity (assumes 20h printing/day, 30 days/month)
  const dailyProfit = profitPerHour * 20
  const monthlyProfit = dailyProfit * 30

  // Build waterfall
  const waterfall: WaterfallLine[] = []
  let remaining = salePrice

  function addLine(label: string, value: number) {
    if (value <= 0) return
    const pct = salePrice > 0 ? (value / salePrice) * 100 : 0
    remaining -= value
    waterfall.push({ label, value, percent: round2(pct), remaining: round2(remaining) })
  }

  if (mkp.totalFee > 0) addLine('Taxa marketplace', mkp.totalFee)
  if (shippingCost > 0) addLine('Frete', shippingCost)
  if (shopeeCouponCost > 0) addLine('Cupom proprio', shopeeCouponCost)
  if (taxAmount > 0) addLine('Imposto', taxAmount)
  if (cardFee > 0) addLine('Taxa cartao', cardFee)
  if (energyCost > 0) addLine('Energia eletrica', energyCost)
  if (filamentCost > 0) addLine('Filamento', filamentCost)
  if (supplierCost > 0) addLine('Custo fornecedor', supplierCost)
  if (packagingCost > 0) addLine('Embalagem', packagingCost)
  if (laborCost > 0) addLine('Mao de obra', laborCost)
  if (otherCosts > 0) addLine('Outros custos', otherCosts)

  return {
    salePrice: round2(salePrice),
    announcedPrice: round2(announcedPrice),
    promoDiscount: round2(promoDiscount),
    pixPrice: round2(pixPrice),
    pixDiscount: round2(pixDiscount),
    waterfall,
    marketplaceCommissionPercent: mkp.commissionPercent,
    marketplaceCommission: round2(mkp.commission),
    marketplaceFixedFee: round2(mkp.fixedFee),
    marketplaceCpfSurcharge: round2(mkp.cpfSurcharge),
    marketplaceAnticipationFee: round2(mkp.anticipationFee),
    marketplaceTotalFee: round2(mkp.totalFee),
    shippingCost: round2(shippingCost),
    shippingDescription,
    taxAmount: round2(taxAmount),
    cardFee: round2(cardFee),
    energyCost: round2(energyCost),
    filamentCost: round2(filamentCost),
    supplierCost: round2(supplierCost),
    packagingCost: round2(packagingCost),
    otherCosts: round2(otherCosts),
    laborCost: round2(laborCost),
    totalCosts: round2(totalCosts),
    profit: round2(profit),
    marginPercent: round2(marginPercent),
    profitPerHour: round2(profitPerHour),
    dailyProfit: round2(dailyProfit),
    monthlyProfit: round2(monthlyProfit),
    shopeeCouponCost: round2(shopeeCouponCost),
  }
}

// ============================================================
// Margin mode: calculate sale price from costs + desired margin
// ============================================================

function calculateSalePriceFromMargin(input: CalculationInput): number {
  const marginPercent = input.pricing.marginPercent || 30

  // Calculate production costs
  let energyCost = 0
  let filamentCost = 0
  let supplierCost = 0

  if (input.productType === '3d') {
    const printer = PRINTERS.find((p) => p.id === input.printerId)
    const printerKw = input.printerId === 'custom' ? input.customPrinterKw : (printer?.avgKw || 0.08)
    const printTimeHours = input.printHours + input.printMinutes / 60
    energyCost = printerKw * printTimeHours * input.kwhPrice
    filamentCost = (input.filamentPricePerKg / 1000) * input.filamentWeightGrams
  } else {
    supplierCost = input.supplierCost || 0
  }

  const laborCost = input.marketplace.type === 'none'
    ? input.laborCostPerHour * (input.laborMinutes / 60)
    : 0

  const baseCosts =
    energyCost +
    filamentCost +
    supplierCost +
    input.packagingCost +
    input.otherCosts +
    laborCost

  // Total deduction rate (as % of sale price)
  let deductionRate = (input.taxPercent + input.payment.cardRatePercent) / 100

  // Add marketplace commission rate
  if (input.marketplace.type === 'mercadolivre') {
    const cat = ML_CATEGORIES[input.marketplace.mlCategory || ML_DEFAULT_CATEGORY]
    const adType = input.marketplace.mlAdType || 'classico'
    const rate = input.marketplace.mlCustomRate ??
      (cat ? cat[adType] : adType === 'classico' ? 11.5 : 16.5)
    deductionRate += rate / 100
    if (input.marketplace.mlParcelamento) deductionRate += 0.0299
  } else if (input.marketplace.type === 'shopee') {
    // Estimate 20% for <R$80, 14% for higher — start with 20% as conservative
    deductionRate += 0.20
    if (input.marketplace.shopeeCampaign) deductionRate += SHOPEE_CAMPAIGN_SURCHARGE / 100
  }

  // The margin is on the sale price: profit = salePrice * (margin/100)
  // salePrice = baseCosts + fixedFees + salePrice * deductionRate + salePrice * (margin/100)
  // salePrice * (1 - deductionRate - margin/100) = baseCosts + fixedFees
  // salePrice = (baseCosts + fixedFees) / (1 - deductionRate - margin/100)

  const denominator = 1 - deductionRate - marginPercent / 100
  if (denominator <= 0) return 0 // impossible margin

  let salePrice = baseCosts / denominator

  // Add fixed fees (ML fixed fee, Shopee fixed fee + shipping)
  if (input.marketplace.type === 'mercadolivre') {
    const fixedFee = getMLFixedFee(salePrice)
    const shipping = input.manualShipping ?? calculateMLShipping(
      input.shippingWeightKg, salePrice, input.mlFreteRapido
    ).cost
    salePrice = (baseCosts + fixedFee + shipping) / denominator
  } else if (input.marketplace.type === 'shopee') {
    const tier = getShopeeTier(salePrice)
    const fixedFee = getShopeeFixedFee(salePrice, tier)
    const cpf = input.marketplace.shopeeSellerType === 'cpf' && input.marketplace.shopeeCpfHighVolume
      ? SHOPEE_CPF_SURCHARGE : 0
    // Shopee frete = R$0 (embutido na taxa)
    salePrice = (baseCosts + fixedFee + cpf) / denominator

    // Re-check tier
    const newTier = getShopeeTier(salePrice)
    if (newTier.commissionPercent !== tier.commissionPercent) {
      const newDenom = 1 - (input.taxPercent + input.payment.cardRatePercent) / 100 -
        newTier.commissionPercent / 100 -
        (input.marketplace.shopeeCampaign ? SHOPEE_CAMPAIGN_SURCHARGE / 100 : 0) -
        marginPercent / 100
      if (newDenom > 0) {
        const newFixed = getShopeeFixedFee(salePrice, newTier)
        salePrice = (baseCosts + newFixed + cpf) / newDenom
      }
    }
  }

  return Math.max(0, round2(salePrice))
}

// ============================================================
// PV Mode: Calculate sale price from supplier cost + target margin
// Uses iterative approach (20 cycles) to converge on correct price
// ============================================================

export function calculatePVSalePrice(
  supplierCost: number,
  targetMarginPercent: number,
  input: CalculationInput
): number {
  if (supplierCost <= 0) return 0

  // Initial estimate: use margin mode calculator as starting point
  let price = supplierCost * (1 + targetMarginPercent / 100) * 1.5

  for (let i = 0; i < 20; i++) {
    // Calculate what the total costs would be at this price
    const tempInput: CalculationInput = {
      ...input,
      pricing: { mode: 'sale-price' as const, salePrice: price },
      productType: 'normal' as const,
      supplierCost,
    }
    const result = calculate(tempInput)
    const targetProfit = price * (targetMarginPercent / 100)
    const actualProfit = result.profit
    const diff = targetProfit - actualProfit

    price += diff

    if (Math.abs(diff) < 0.01) break
  }

  return Math.max(0, round2(price))
}

// ============================================================
// CF Mode: Calculate max supplier cost from target sale price + margin
// ============================================================

export interface CFResult {
  maxCost: number
  breakdown: { label: string; value: number }[]
}

export function calculateMaxSupplierCost(
  targetSalePrice: number,
  targetMarginPercent: number,
  input: CalculationInput
): CFResult {
  if (targetSalePrice <= 0) return { maxCost: 0, breakdown: [] }

  // Calculate all costs at target price with zero supplier cost
  const tempInput: CalculationInput = {
    ...input,
    pricing: { mode: 'sale-price' as const, salePrice: targetSalePrice },
    productType: 'normal' as const,
    supplierCost: 0,
  }
  const result = calculate(tempInput)

  const targetProfit = targetSalePrice * (targetMarginPercent / 100)
  // maxCost = salePrice - all_other_costs - targetProfit
  const maxCost = targetSalePrice - result.totalCosts - targetProfit

  const breakdown: { label: string; value: number }[] = []
  if (result.marketplaceTotalFee > 0) breakdown.push({ label: 'Taxa marketplace', value: result.marketplaceTotalFee })
  if (result.shippingCost > 0) breakdown.push({ label: 'Frete', value: result.shippingCost })
  if (result.shopeeCouponCost > 0) breakdown.push({ label: 'Cupom proprio', value: result.shopeeCouponCost })
  if (result.taxAmount > 0) breakdown.push({ label: 'Imposto', value: result.taxAmount })
  if (result.cardFee > 0) breakdown.push({ label: 'Taxa cartao', value: result.cardFee })
  if (result.packagingCost > 0) breakdown.push({ label: 'Embalagem', value: result.packagingCost })
  if (result.laborCost > 0) breakdown.push({ label: 'Mao de obra', value: result.laborCost })
  if (result.otherCosts > 0) breakdown.push({ label: 'Outros custos', value: result.otherCosts })
  breakdown.push({ label: 'Lucro desejado', value: round2(targetProfit) })

  return { maxCost: round2(maxCost), breakdown }
}

// ============================================================
// Marketplace fee calculation
// ============================================================

interface MarketplaceFeeResult {
  commissionPercent: number
  commission: number
  fixedFee: number
  cpfSurcharge: number
  anticipationFee: number
  totalFee: number
}

function calculateMarketplaceFees(
  salePrice: number,
  marketplace: MarketplaceConfig
): MarketplaceFeeResult {
  const zero = { commissionPercent: 0, commission: 0, fixedFee: 0, cpfSurcharge: 0, anticipationFee: 0, totalFee: 0 }
  if (marketplace.type === 'none' || salePrice <= 0) return zero

  if (marketplace.type === 'mercadolivre') {
    const cat = ML_CATEGORIES[marketplace.mlCategory || ML_DEFAULT_CATEGORY]
    const adType = marketplace.mlAdType || 'classico'

    const commissionPercent = marketplace.mlCustomRate ??
      (cat ? cat[adType] : adType === 'classico' ? 11.5 : 16.5)

    const commission = salePrice * (commissionPercent / 100)
    const fixedFee = getMLFixedFee(salePrice)
    const anticipationFee = marketplace.mlParcelamento ? salePrice * 0.0299 : 0

    return {
      commissionPercent,
      commission,
      fixedFee,
      cpfSurcharge: 0,
      anticipationFee,
      totalFee: commission + fixedFee + anticipationFee,
    }
  }

  // Shopee
  const tier = getShopeeTier(salePrice)
  const campaignExtra = marketplace.shopeeCampaign ? SHOPEE_CAMPAIGN_SURCHARGE : 0
  const commissionPercent = tier.commissionPercent + campaignExtra
  let commission = salePrice * (commissionPercent / 100)
  if (commission > SHOPEE_COMMISSION_CAP) commission = SHOPEE_COMMISSION_CAP
  const fixedFee = getShopeeFixedFee(salePrice, tier)
  const cpfSurcharge =
    marketplace.shopeeSellerType === 'cpf' && marketplace.shopeeCpfHighVolume
      ? SHOPEE_CPF_SURCHARGE
      : 0

  return {
    commissionPercent,
    commission,
    fixedFee,
    cpfSurcharge,
    anticipationFee: 0,
    totalFee: commission + fixedFee + cpfSurcharge,
  }
}

// ============================================================
// Helpers
// ============================================================

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function emptyResult(): CalculationResult {
  return {
    salePrice: 0,
    announcedPrice: 0,
    promoDiscount: 0,
    pixPrice: 0,
    pixDiscount: 0,
    waterfall: [],
    marketplaceCommissionPercent: 0,
    marketplaceCommission: 0,
    marketplaceFixedFee: 0,
    marketplaceCpfSurcharge: 0,
    marketplaceAnticipationFee: 0,
    marketplaceTotalFee: 0,
    shippingCost: 0,
    shippingDescription: '',
    taxAmount: 0,
    cardFee: 0,
    energyCost: 0,
    filamentCost: 0,
    supplierCost: 0,
    packagingCost: 0,
    otherCosts: 0,
    laborCost: 0,
    totalCosts: 0,
    profit: 0,
    marginPercent: 0,
    profitPerHour: 0,
    dailyProfit: 0,
    monthlyProfit: 0,
    shopeeCouponCost: 0,
  }
}
