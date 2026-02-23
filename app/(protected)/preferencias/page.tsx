'use client'

import { useState, useEffect } from 'react'
import { loadPrefs, savePrefs, DEFAULT_PREFS, type Preferences } from '@/lib/preferences'
import { PRINTERS, CUSTOM_PRINTER_ID } from '@/lib/printers'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Check, RotateCcw } from 'lucide-react'

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
      {title}
    </h3>
  )
}

export default function PreferenciasPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS)
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setPrefs(loadPrefs())
    setMounted(true)
  }, [])

  function parseNum(val: string, fallback: number): number {
    const n = parseFloat(val)
    return isNaN(n) ? fallback : n
  }

  function handleSave() {
    savePrefs(prefs)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleReset() {
    setPrefs(DEFAULT_PREFS)
    savePrefs(DEFAULT_PREFS)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function update(partial: Partial<Preferences>) {
    setPrefs((prev) => ({ ...prev, ...partial }))
  }

  if (!mounted) return null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Preferencias</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Valores padrao usados na calculadora
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Card 1: Impressora & Energia */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionTitle title="Impressora & Energia" />
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Impressora preferida
                </Label>
                <Select
                  value={prefs.printerId}
                  onValueChange={(v) => update({ printerId: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRINTERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.avgKw.toFixed(2).replace('.', ',')} kWh/h
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_PRINTER_ID}>
                      Outra impressora (digitar kWh)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Valor do kWh (R$)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={prefs.kwhPrice}
                  onChange={(e) =>
                    update({ kwhPrice: parseNum(e.target.value, 0) })
                  }
                  className="mt-1 font-mono w-32"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Media nacional ~ R$0,85
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Filamento */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionTitle title="Filamento" />
            <div>
              <Label className="text-xs text-muted-foreground">
                Custo padrao do filamento (R$/kg)
              </Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={prefs.filamentPricePerKg}
                onChange={(e) =>
                  update({ filamentPricePerKg: parseNum(e.target.value, 0) })
                }
                className="mt-1 font-mono w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Custos Fixos */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionTitle title="Custos Fixos" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Embalagem padrao (R$)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={prefs.packagingCost || ''}
                  onChange={(e) =>
                    update({ packagingCost: parseNum(e.target.value, 0) })
                  }
                  placeholder="0,00"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Imposto padrao (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={prefs.taxPercent || ''}
                  onChange={(e) =>
                    update({ taxPercent: parseNum(e.target.value, 0) })
                  }
                  placeholder="0"
                  className="mt-1 font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Simples: 4-19,5% · MEI isento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Margem & Promo */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionTitle title="Margem & Promocao" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Margem padrao (%)
                </Label>
                <Input
                  type="number"
                  min={5}
                  max={80}
                  step={1}
                  value={prefs.marginPercent}
                  onChange={(e) =>
                    update({ marginPercent: parseNum(e.target.value, 30) })
                  }
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Desconto promo padrao (%)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  step={1}
                  value={prefs.promoDiscount}
                  onChange={(e) =>
                    update({ promoDiscount: parseNum(e.target.value, 10) })
                  }
                  className="mt-1 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Venda Direta */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionTitle title="Venda Direta" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Taxa do cartao padrao (%)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={0.01}
                    value={prefs.cardRatePercent || ''}
                    onChange={(e) =>
                      update({ cardRatePercent: parseNum(e.target.value, 0) })
                    }
                    placeholder="0"
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Desconto Pix padrao (%)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={1}
                    value={prefs.pixDiscountPercent}
                    onChange={(e) =>
                      update({
                        pixDiscountPercent: parseNum(e.target.value, 0),
                      })
                    }
                    className="mt-1 font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Mao de obra padrao (R$/h)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={prefs.laborCostPerHour}
                  onChange={(e) =>
                    update({ laborCostPerHour: parseNum(e.target.value, 0) })
                  }
                  className="mt-1 font-mono w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Shopee */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionTitle title="Shopee" />
            <div>
              <Label className="text-xs text-muted-foreground">
                Tipo de vendedor padrao
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => update({ shopeeSellerType: 'cnpj' })}
                  className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                    prefs.shopeeSellerType === 'cnpj'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <span className="text-sm font-semibold block">CNPJ</span>
                  <span className="text-[10px] text-muted-foreground">
                    Tabela padrao
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => update({ shopeeSellerType: 'cpf' })}
                  className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                    prefs.shopeeSellerType === 'cpf'
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <span className="text-sm font-semibold block">CPF</span>
                  <span className="text-[10px] text-muted-foreground">
                    +R$3/item (alto vol.)
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <Button
            onClick={handleSave}
            disabled={saved}
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg"
            size="lg"
          >
            {saved ? (
              <>
                <Check className="size-4" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="size-4" />
                Salvar preferencias
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="rounded-lg"
          >
            <RotateCcw className="size-4" />
            Restaurar padrao
          </Button>
        </div>
      </div>
    </div>
  )
}
