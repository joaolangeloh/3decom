'use client'

import { type CalculationResult } from '@/lib/calculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Check } from 'lucide-react'

function formatBRL(value: number): string {
  return value
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

interface CostLineProps {
  label: string
  value: number
  total: number
  color: string
}

function CostLine({ label, value, total, color }: CostLineProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-mono text-sm">R$ {formatBRL(value)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

interface PriceBreakdownProps {
  result: CalculationResult
  onSave: () => void
  saving: boolean
  saved: boolean
}

export function PriceBreakdown({
  result,
  onSave,
  saving,
  saved,
}: PriceBreakdownProps) {
  const colors = {
    material: 'hsl(160 100% 45%)',
    energy: 'hsl(40 90% 55%)',
    machine: 'hsl(200 80% 55%)',
    labor: 'hsl(280 70% 60%)',
    markup: 'hsl(160 60% 35%)',
    marketplace: 'hsl(0 72% 51%)',
  }

  return (
    <Card className="sticky top-6 border-border">
      <CardHeader>
        <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Resumo do Preco
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CostLine
          label="Material"
          value={result.materialCost}
          total={result.finalPrice}
          color={colors.material}
        />
        <CostLine
          label="Energia"
          value={result.energyCost}
          total={result.finalPrice}
          color={colors.energy}
        />
        <CostLine
          label="Maquina"
          value={result.machineCost}
          total={result.finalPrice}
          color={colors.machine}
        />
        <CostLine
          label="Mao de obra"
          value={result.laborCost}
          total={result.finalPrice}
          color={colors.labor}
        />

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Subtotal</span>
          <span className="font-mono text-sm font-medium">
            R$ {formatBRL(result.subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Margem
          </span>
          <span className="font-mono text-sm text-accent">
            + R$ {formatBRL(result.markup)}
          </span>
        </div>

        {result.marketplaceFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Taxa marketplace ({result.marketplaceFeePercent}%)
            </span>
            <span className="font-mono text-sm text-destructive">
              + R$ {formatBRL(result.marketplaceFee)}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold">Preco Final</span>
          <span className="font-mono text-3xl font-bold text-accent">
            R$ {formatBRL(result.finalPrice)}
          </span>
        </div>

        <Button
          onClick={onSave}
          disabled={saving || saved}
          className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check className="size-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="size-4" />
              Salvar Calculo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
