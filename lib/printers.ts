// Bambu Lab printers with average power consumption during printing
// Values are average kW (including heated bed, motors, hotend)

export interface Printer {
  id: string
  name: string
  brand: string
  avgKw: number // average consumption in kW during printing
}

export const PRINTERS: Printer[] = [
  { id: 'a1-mini', name: 'A1 Mini', brand: 'Bambu Lab', avgKw: 0.08 },
  { id: 'a1', name: 'A1', brand: 'Bambu Lab', avgKw: 0.10 },
  { id: 'p1p', name: 'P1P', brand: 'Bambu Lab', avgKw: 0.10 },
  { id: 'p1s', name: 'P1S', brand: 'Bambu Lab', avgKw: 0.10 },
  { id: 'x1c', name: 'X1 Carbon', brand: 'Bambu Lab', avgKw: 0.11 },
  { id: 'h2d', name: 'H2D', brand: 'Bambu Lab', avgKw: 0.20 },
]

// Special ID for user-defined custom printer
export const CUSTOM_PRINTER_ID = 'custom'
export const DEFAULT_PRINTER_ID = 'a1-mini'

export function getPrinter(id: string): Printer | undefined {
  return PRINTERS.find((p) => p.id === id)
}
