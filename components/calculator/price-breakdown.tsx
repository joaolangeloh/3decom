'use client'

import { useState } from 'react'
import { type CalculationResult } from '@/lib/calculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Save,
  Loader2,
  Check,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  CalendarDays,
  AlertTriangle,
  Info,
  Tag,
} from 'lucide-react'

function formatBRL(value: number): string {
  return value
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function getMarginHealth(marginPercent: number): { color: string; label: string } {
  if (marginPercent >= 50) return { color: '#00e5a0', label: 'Excelente' }
  if (marginPercent >= 35) return { color: '#7fff00', label: 'Muito boa' }
  if (marginPercent >= 25) return { color: '#ffb020', label: 'Boa' }
  if (marginPercent >= 15) return { color: '#ff8800', label: 'Apertada' }
  if (marginPercent >= 5) return { color: '#ff4444', label: 'Muito apertada' }
  if (marginPercent >= 0) return { color: '#ff0000', label: 'Insustentável' }
  return { color: '#cc0000', label: 'Prejuízo' }
}

interface PriceBreakdownProps {
  result: CalculationResult
  onSave: (productName: string) => void
  saving: boolean
  saved: boolean
  printTimeHours: number
  marketplaceType: 'none' | 'mercadolivre' | 'shopee'
  editingName?: string | null
}

export function PriceBreakdown({
  result,
  onSave,
  saving,
  saved,
  printTimeHours,
  marketplaceType,
  editingName,
}: PriceBreakdownProps) {
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [productName, setProductName] = useState(editingName ?? '')

  const isProfit = result.profit >= 0
  const hasData = result.salePrice > 0
  const health = getMarginHealth(result.marginPercent)

  if (!hasData) {
    return (
      <Card className="sticky top-6 border-border">
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">🧮</div>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Configure os custos e o preço para ver o resultado aqui em tempo
            real.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-6 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Detalhamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Promo price */}
        {result.promoDiscount > 0 && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="size-3.5 text-accent" />
              <span className="text-xs font-semibold text-accent">
                Preço de promoção
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Anunciar por
              </span>
              <span className="font-mono text-lg font-bold text-accent">
                R$ {formatBRL(result.announcedPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-muted-foreground">
                Com desconto aplicado
              </span>
              <span className="font-mono text-sm">
                R$ {formatBRL(result.salePrice)}
              </span>
            </div>
          </div>
        )}

        {/* Sale price header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold flex items-center gap-2">
            🏷️ Preço de venda
          </span>
          <span className="font-mono text-lg font-bold">
            R$ {formatBRL(result.salePrice)}
          </span>
        </div>

        <Separator />

        {/* Waterfall deductions */}
        <div className="space-y-0">
          {result.waterfall.map((line, i) => (
            <div key={i} className="py-2 border-b border-border/50 last:border-0">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5 text-xs">└─</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {line.label}
                    </span>
                    <span className="font-mono text-sm text-destructive shrink-0">
                      − R$ {formatBRL(line.value)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      {line.percent.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      = R$ {formatBRL(line.remaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Profit / Loss */}
        <div
          className={`rounded-lg p-4 ${
            isProfit
              ? 'bg-accent/5 border border-accent/20'
              : 'bg-destructive/5 border border-destructive/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isProfit ? (
              <TrendingUp className="size-4 text-accent" />
            ) : (
              <TrendingDown className="size-4 text-destructive" />
            )}
            <span
              className={`text-sm font-bold ${
                isProfit ? 'text-accent' : 'text-destructive'
              }`}
            >
              {isProfit ? 'Lucro líquido' : 'Prejuízo'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-2xl font-bold ${
                isProfit ? 'text-accent' : 'text-destructive'
              }`}
            >
              R$ {formatBRL(Math.abs(result.profit))}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-sm font-semibold ${
                  isProfit ? 'text-accent' : 'text-destructive'
                }`}
              >
                {result.marginPercent.toFixed(1)}%
              </span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: health.color + '20',
                  color: health.color,
                }}
              >
                {health.label}
              </span>
            </div>
          </div>

          {/* Profit per hour */}
          {printTimeHours > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span className="font-mono">
                R$ {formatBRL(result.profitPerHour)}/hora
              </span>
            </div>
          )}
        </div>

        {/* Graduated alerts */}
        {result.profit < 0 && (
          <div className="flex items-start gap-2 text-destructive bg-destructive/5 rounded-lg p-3">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <p>
                Você está vendendo com prejuízo. Aumente o preço de venda ou
                reduza seus custos.
              </p>
              <p className="font-mono">
                Preço mínimo (break-even): R$ {formatBRL(result.totalCosts)}
              </p>
            </div>
          </div>
        )}
        {result.profit >= 0 && result.marginPercent < 10 && (
          <div className="flex items-start gap-2 text-orange-500 bg-orange-500/5 rounded-lg p-3">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <p className="text-xs">
              Margem muito baixa — considere aumentar o preço
            </p>
          </div>
        )}
        {result.marginPercent >= 10 && result.marginPercent < 20 && (
          <div className="flex items-start gap-2 text-yellow-500 bg-yellow-500/5 rounded-lg p-3">
            <Info className="size-4 mt-0.5 shrink-0" />
            <p className="text-xs">
              Margem apertada — monitore seus custos
            </p>
          </div>
        )}

        {/* Pix price */}
        {result.pixDiscount > 0 && result.pixPrice > 0 && (
          <div className="bg-secondary/50 rounded-lg p-3 text-xs">
            <span className="text-muted-foreground">Preço no Pix: </span>
            <span className="font-mono font-semibold text-accent">
              R$ {formatBRL(result.pixPrice)}
            </span>
            <span className="text-muted-foreground">
              {' '}(−{result.pixDiscount.toFixed(0).replace('.', ',')}%)
            </span>
          </div>
        )}

        {/* Production capacity */}
        {printTimeHours > 0 && isProfit && (
          <>
            <Separator />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Capacidade produtiva
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3" />
                    Potencial diário (20h)
                  </span>
                  <span className="font-mono font-semibold">
                    R$ {formatBRL(result.dailyProfit)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-3" />
                    Potencial mensal (30d)
                  </span>
                  <span className="font-mono font-semibold text-accent">
                    R$ {formatBRL(result.monthlyProfit)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Marketplace fee detail */}
        {result.marketplaceTotalFee > 0 && (
          <>
            <Separator />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Detalhe {marketplaceType === 'mercadolivre' ? 'Mercado Livre' : 'Shopee'}
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Comissão ({result.marketplaceCommissionPercent}%)
                  </span>
                  <span className="font-mono">
                    R$ {formatBRL(result.marketplaceCommission)}
                  </span>
                </div>
                {result.marketplaceFixedFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa fixa</span>
                    <span className="font-mono">
                      R$ {formatBRL(result.marketplaceFixedFee)}
                    </span>
                  </div>
                )}
                {result.marketplaceAnticipationFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Antecipação parcelamento</span>
                    <span className="font-mono">
                      R$ {formatBRL(result.marketplaceAnticipationFee)}
                    </span>
                  </div>
                )}
                {result.marketplaceCpfSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Adicional CPF
                    </span>
                    <span className="font-mono">
                      R$ {formatBRL(result.marketplaceCpfSurcharge)}
                    </span>
                  </div>
                )}
                {result.shippingCost > 0 && (
                  <div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="font-mono">
                        R$ {formatBRL(result.shippingCost)}
                      </span>
                    </div>
                    {result.shippingDescription && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {result.shippingDescription}
                      </p>
                    )}
                  </div>
                )}
                {result.shopeeCouponCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cupom próprio</span>
                    <span className="font-mono">
                      R$ {formatBRL(result.shopeeCouponCost)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Save button */}
        {!showNamePrompt ? (
          <Button
            onClick={() => setShowNamePrompt(true)}
            disabled={saving || saved || !hasData}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg"
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
                Salvar Cálculo
              </>
            )}
          </Button>
        ) : (
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Input
              autoFocus
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Vaso decorativo, Suporte celular..."
              className="font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && productName.trim()) {
                  onSave(productName.trim())
                  setShowNamePrompt(false)
                  setProductName('')
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (productName.trim()) {
                    onSave(productName.trim())
                    setShowNamePrompt(false)
                    setProductName('')
                  }
                }}
                disabled={!productName.trim() || saving}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg"
                size="sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Salvar
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowNamePrompt(false)
                  setProductName('')
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
