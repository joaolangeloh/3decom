'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { type Tables } from '@/lib/database.types'
import { calculate, type CalculationInput } from '@/lib/calculator'
import { saveCalculation } from '@/app/(protected)/calculadora/actions'
import { PriceBreakdown } from './price-breakdown'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package, Cpu, ArrowRight } from 'lucide-react'

type Material = Tables<'materials'>
type Machine = Tables<'machines'>

interface CalculatorFormProps {
  materials: Material[]
  machines: Machine[]
}

function SectionHeader({
  number,
  title,
}: {
  number: number
  title: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center size-6 rounded-full bg-accent text-accent-foreground text-xs font-bold font-mono">
        {number}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
    </div>
  )
}

export function CalculatorForm({ materials, machines }: CalculatorFormProps) {
  // Form state
  const [name, setName] = useState('')
  const [weightGrams, setWeightGrams] = useState(50)
  const [printHours, setPrintHours] = useState(2)
  const [printMinutes, setPrintMinutes] = useState(0)

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('')
  const [selectedMachineId, setSelectedMachineId] = useState<string>('')

  // Manual overrides (used when no material/machine selected)
  const [manualPricePerKg, setManualPricePerKg] = useState(120)
  const [manualHourlyCost, setManualHourlyCost] = useState(2)
  const [manualPowerWatts, setManualPowerWatts] = useState(350)

  const [energyCostPerKwh, setEnergyCostPerKwh] = useState(0.85)
  const [laborCostPerHour, setLaborCostPerHour] = useState(0)
  const [laborTimeMinutes, setLaborTimeMinutes] = useState(30)
  const [markupPercent, setMarkupPercent] = useState(50)
  const [marketplace, setMarketplace] = useState<
    'none' | 'mercadolivre' | 'shopee'
  >('none')

  const [saving, startSaving] = useTransition()
  const [saved, setSaved] = useState(false)

  // Derived values from selected material/machine
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId)
  const selectedMachine = machines.find((m) => m.id === selectedMachineId)

  const materialPricePerKg = selectedMaterial
    ? selectedMaterial.price_per_kg
    : manualPricePerKg
  const machineHourlyCost = selectedMachine
    ? selectedMachine.hourly_cost
    : manualHourlyCost
  const machinePowerWatts = selectedMachine
    ? selectedMachine.power_consumption_watts
    : manualPowerWatts

  const printTimeMinutes = printHours * 60 + printMinutes

  // Real-time calculation
  const input: CalculationInput = useMemo(
    () => ({
      weightGrams,
      printTimeMinutes,
      materialPricePerKg,
      machineHourlyCost,
      energyCostPerKwh,
      machinePowerWatts,
      laborCostPerHour,
      laborTimeMinutes,
      markupPercent,
      marketplace,
    }),
    [
      weightGrams,
      printTimeMinutes,
      materialPricePerKg,
      machineHourlyCost,
      energyCostPerKwh,
      machinePowerWatts,
      laborCostPerHour,
      laborTimeMinutes,
      markupPercent,
      marketplace,
    ]
  )

  const result = useMemo(() => calculate(input), [input])

  function handleSave() {
    setSaved(false)
    startSaving(async () => {
      const response = await saveCalculation({
        name,
        materialId: selectedMaterialId || null,
        machineId: selectedMachineId || null,
        weightGrams,
        printTimeMinutes,
        materialCost: result.materialCost,
        energyCost: result.energyCost,
        laborCost: result.laborCost,
        markupPercent,
        finalPrice: result.finalPrice,
        marketplace: marketplace === 'none' ? null : marketplace,
        marketplaceFee:
          result.marketplaceFee > 0 ? result.marketplaceFee : null,
        inputData: input as unknown as Record<string, number | string>,
      })
      if (response.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  // Helpers for parsing number inputs
  function parseNum(val: string, fallback: number): number {
    const n = parseFloat(val)
    return isNaN(n) ? fallback : n
  }

  function parseIntNum(val: string, fallback: number): number {
    const n = parseInt(val, 10)
    return isNaN(n) ? fallback : n
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Left Column - Form */}
      <div className="space-y-6">
        {/* Section 1: Piece Details */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={1} title="Peca" />
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da peca</Label>
                <Input
                  id="name"
                  placeholder="Ex: Vaso decorativo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="weight">Peso (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  min={0}
                  step={1}
                  value={weightGrams}
                  onChange={(e) =>
                    setWeightGrams(parseNum(e.target.value, 0))
                  }
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label>Tempo de impressao</Label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={printHours}
                      onChange={(e) =>
                        setPrintHours(parseIntNum(e.target.value, 0))
                      }
                      className="font-mono pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      hrs
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      step={1}
                      value={printMinutes}
                      onChange={(e) =>
                        setPrintMinutes(parseIntNum(e.target.value, 0))
                      }
                      className="font-mono pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Material and Machine */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={2} title="Material e Maquina" />
            <div className="space-y-4">
              {/* Material */}
              <div>
                <Label>Material</Label>
                {materials.length === 0 ? (
                  <Link
                    href="/materiais"
                    className="flex items-center gap-2 mt-1.5 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <Package className="size-4" />
                    Adicione materiais primeiro
                    <ArrowRight className="size-3 ml-auto" />
                  </Link>
                ) : (
                  <Select
                    value={selectedMaterialId}
                    onValueChange={setSelectedMaterialId}
                  >
                    <SelectTrigger className="w-full mt-1.5">
                      <SelectValue placeholder="Selecione um material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({m.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedMaterial && (
                  <p className="text-xs text-muted-foreground font-mono mt-1.5">
                    R${' '}
                    {selectedMaterial.price_per_kg
                      .toFixed(2)
                      .replace('.', ',')}{' '}
                    /kg
                  </p>
                )}
                {!selectedMaterial && materials.length > 0 && (
                  <div className="mt-2">
                    <Label
                      htmlFor="manualPrice"
                      className="text-xs text-muted-foreground"
                    >
                      Preco por kg (manual)
                    </Label>
                    <Input
                      id="manualPrice"
                      type="number"
                      min={0}
                      step={0.01}
                      value={manualPricePerKg}
                      onChange={(e) =>
                        setManualPricePerKg(parseNum(e.target.value, 0))
                      }
                      className="mt-1 font-mono"
                    />
                  </div>
                )}
                {materials.length === 0 && (
                  <div className="mt-2">
                    <Label
                      htmlFor="manualPrice"
                      className="text-xs text-muted-foreground"
                    >
                      Preco por kg (manual)
                    </Label>
                    <Input
                      id="manualPrice"
                      type="number"
                      min={0}
                      step={0.01}
                      value={manualPricePerKg}
                      onChange={(e) =>
                        setManualPricePerKg(parseNum(e.target.value, 0))
                      }
                      className="mt-1 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Machine */}
              <div>
                <Label>Maquina</Label>
                {machines.length === 0 ? (
                  <Link
                    href="/maquinas"
                    className="flex items-center gap-2 mt-1.5 p-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <Cpu className="size-4" />
                    Adicione maquinas primeiro
                    <ArrowRight className="size-3 ml-auto" />
                  </Link>
                ) : (
                  <Select
                    value={selectedMachineId}
                    onValueChange={setSelectedMachineId}
                  >
                    <SelectTrigger className="w-full mt-1.5">
                      <SelectValue placeholder="Selecione uma maquina" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedMachine && (
                  <p className="text-xs text-muted-foreground font-mono mt-1.5">
                    R${' '}
                    {selectedMachine.hourly_cost.toFixed(2).replace('.', ',')}{' '}
                    /hora &middot; {selectedMachine.power_consumption_watts}W
                  </p>
                )}
                {!selectedMachine && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="manualHourly"
                        className="text-xs text-muted-foreground"
                      >
                        Custo/hora (R$)
                      </Label>
                      <Input
                        id="manualHourly"
                        type="number"
                        min={0}
                        step={0.01}
                        value={manualHourlyCost}
                        onChange={(e) =>
                          setManualHourlyCost(parseNum(e.target.value, 0))
                        }
                        className="mt-1 font-mono"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="manualWatts"
                        className="text-xs text-muted-foreground"
                      >
                        Potencia (W)
                      </Label>
                      <Input
                        id="manualWatts"
                        type="number"
                        min={0}
                        step={1}
                        value={manualPowerWatts}
                        onChange={(e) =>
                          setManualPowerWatts(parseNum(e.target.value, 0))
                        }
                        className="mt-1 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Additional Costs */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={3} title="Custos Adicionais" />
            <div className="space-y-4">
              <div>
                <Label htmlFor="energyCost">Custo de energia (R$/kWh)</Label>
                <Input
                  id="energyCost"
                  type="number"
                  min={0}
                  step={0.01}
                  value={energyCostPerKwh}
                  onChange={(e) =>
                    setEnergyCostPerKwh(parseNum(e.target.value, 0))
                  }
                  className="mt-1.5 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="laborCost">
                    Mao de obra (R$/hora)
                  </Label>
                  <Input
                    id="laborCost"
                    type="number"
                    min={0}
                    step={0.01}
                    value={laborCostPerHour}
                    onChange={(e) =>
                      setLaborCostPerHour(parseNum(e.target.value, 0))
                    }
                    className="mt-1.5 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="laborTime">
                    Tempo de mao de obra (min)
                  </Label>
                  <Input
                    id="laborTime"
                    type="number"
                    min={0}
                    step={1}
                    value={laborTimeMinutes}
                    onChange={(e) =>
                      setLaborTimeMinutes(parseIntNum(e.target.value, 0))
                    }
                    className="mt-1.5 font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Margin and Marketplace */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={4} title="Margem e Marketplace" />
            <div className="space-y-4">
              <div>
                <Label htmlFor="markup">Margem de lucro (%)</Label>
                <Input
                  id="markup"
                  type="number"
                  min={0}
                  step={1}
                  value={markupPercent}
                  onChange={(e) =>
                    setMarkupPercent(parseNum(e.target.value, 0))
                  }
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Canal de venda</Label>
                <Tabs
                  value={marketplace}
                  onValueChange={(v) =>
                    setMarketplace(v as 'none' | 'mercadolivre' | 'shopee')
                  }
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="none" className="flex-1">
                      Venda Direta
                    </TabsTrigger>
                    <TabsTrigger value="mercadolivre" className="flex-1">
                      Mercado Livre
                      <span className="ml-1 text-[10px] font-mono opacity-60">
                        16%
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="shopee" className="flex-1">
                      Shopee
                      <span className="ml-1 text-[10px] font-mono opacity-60">
                        20%
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Price Breakdown */}
      <div className="lg:order-last">
        <PriceBreakdown
          result={result}
          onSave={handleSave}
          saving={saving}
          saved={saved}
        />
      </div>
    </div>
  )
}
