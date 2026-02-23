export interface CalculationInput {
  weightGrams: number
  printTimeMinutes: number
  materialPricePerKg: number
  machineHourlyCost: number
  energyCostPerKwh: number
  machinePowerWatts: number
  laborCostPerHour: number
  laborTimeMinutes: number
  markupPercent: number
  marketplace: 'none' | 'mercadolivre' | 'shopee'
}

export interface CalculationResult {
  materialCost: number
  energyCost: number
  machineCost: number
  laborCost: number
  subtotal: number
  markup: number
  marketplaceFee: number
  marketplaceFeePercent: number
  finalPrice: number
}

export function calculate(input: CalculationInput): CalculationResult {
  // Material cost: (weight / 1000) * price per kg
  const materialCost = (input.weightGrams / 1000) * input.materialPricePerKg

  // Energy cost: (power in kW) * (time in hours) * (cost per kWh)
  const printTimeHours = input.printTimeMinutes / 60
  const energyCost =
    (input.machinePowerWatts / 1000) * printTimeHours * input.energyCostPerKwh

  // Machine cost: hourly cost * time in hours (depreciation, maintenance)
  const machineCost = input.machineHourlyCost * printTimeHours

  // Labor cost
  const laborCost = input.laborCostPerHour * (input.laborTimeMinutes / 60)

  const subtotal = materialCost + energyCost + machineCost + laborCost
  const markup = subtotal * (input.markupPercent / 100)
  const priceBeforeFees = subtotal + markup

  // Marketplace fees
  let marketplaceFeePercent = 0
  if (input.marketplace === 'mercadolivre') marketplaceFeePercent = 16
  if (input.marketplace === 'shopee') marketplaceFeePercent = 20

  const marketplaceFee = priceBeforeFees * (marketplaceFeePercent / 100)
  const finalPrice = priceBeforeFees + marketplaceFee

  return {
    materialCost: round2(materialCost),
    energyCost: round2(energyCost),
    machineCost: round2(machineCost),
    laborCost: round2(laborCost),
    subtotal: round2(subtotal),
    markup: round2(markup),
    marketplaceFee: round2(marketplaceFee),
    marketplaceFeePercent,
    finalPrice: round2(finalPrice),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
