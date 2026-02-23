import { DEFAULT_PRINTER_ID } from './printers'

export interface Preferences {
  filamentPricePerKg: number
  kwhPrice: number
  packagingCost: number
  taxPercent: number
  marginPercent: number
  promoDiscount: number
  cardRatePercent: number
  pixDiscountPercent: number
  printerId: string
  laborCostPerHour: number
  shopeeSellerType: 'cpf' | 'cnpj'
}

export const DEFAULT_PREFS: Preferences = {
  filamentPricePerKg: 80,
  kwhPrice: 0.85,
  packagingCost: 0,
  taxPercent: 0,
  marginPercent: 30,
  promoDiscount: 10,
  cardRatePercent: 0,
  pixDiscountPercent: 5,
  printerId: DEFAULT_PRINTER_ID,
  laborCostPerHour: 35,
  shopeeSellerType: 'cnpj',
}

const STORAGE_KEY = '3decom-prefs'

export function loadPrefs(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_PREFS
}

export function savePrefs(prefs: Preferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {}
}
