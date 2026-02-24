'use client'

import { useState, useEffect } from 'react'
import { loadPrefs, savePrefs, DEFAULT_PREFS, type Preferences } from '@/lib/preferences'
import { PRINTERS, CUSTOM_PRINTER_ID } from '@/lib/printers'
import { Card, CardContent } from '@/components/ui/card'
import { DecimalInput } from '@/components/ui/decimal-input'
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
        <h1 className="text-2xl font-bold">Preferências</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Valores padrão usados na calculadora
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
                <DecimalInput
                  value={prefs.kwhPrice}
                  onValueChange={(v) => update({ kwhPrice: v })}
                  className="mt-1 font-mono w-32"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Média nacional ~ R$0,85
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
                Custo padrão do filamento (R$/kg)
              </Label>
              <DecimalInput
                value={prefs.filamentPricePerKg}
                onValueChange={(v) => update({ filamentPricePerKg: v })}
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
                  Embalagem padrão (R$)
                </Label>
                <DecimalInput
                  value={prefs.packagingCost}
                  onValueChange={(v) => update({ packagingCost: v })}
                  hideZero
                  placeholder="0,00"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Imposto padrão (%)
                </Label>
                <DecimalInput
                  value={prefs.taxPercent}
                  onValueChange={(v) => update({ taxPercent: v })}
                  hideZero
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
            <SectionTitle title="Margem & Promoção" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Margem padrão (%)
                </Label>
                <DecimalInput
                  value={prefs.marginPercent}
                  onValueChange={(v) => update({ marginPercent: v })}
                  integer
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Desconto promo padrão (%)
                </Label>
                <DecimalInput
                  value={prefs.promoDiscount}
                  onValueChange={(v) => update({ promoDiscount: v })}
                  integer
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
                    Taxa do cartão padrão (%)
                  </Label>
                  <DecimalInput
                    value={prefs.cardRatePercent}
                    onValueChange={(v) => update({ cardRatePercent: v })}
                    hideZero
                    placeholder="0"
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Desconto Pix padrão (%)
                  </Label>
                  <DecimalInput
                    value={prefs.pixDiscountPercent}
                    onValueChange={(v) => update({ pixDiscountPercent: v })}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Mão de obra padrão (R$/h)
                </Label>
                <DecimalInput
                  value={prefs.laborCostPerHour}
                  onValueChange={(v) => update({ laborCostPerHour: v })}
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
                Tipo de vendedor padrão
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
                    Tabela padrão
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
                Salvar preferências
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
            Restaurar padrão
          </Button>
        </div>
      </div>
    </div>
  )
}
