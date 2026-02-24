'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import {
  calculate,
  calculatePVSalePrice,
  calculateMaxSupplierCost,
  type CalculationInput,
  type MarketplaceConfig,
  type PricingMode,
  type PromoConfig,
  type PaymentConfig,
} from '@/lib/calculator'
import { ML_CATEGORIES, ML_DEFAULT_CATEGORY } from '@/lib/marketplace-fees'
import { PRINTERS, DEFAULT_PRINTER_ID, CUSTOM_PRINTER_ID } from '@/lib/printers'
import { loadPrefs, savePrefs, DEFAULT_PREFS, type Preferences } from '@/lib/preferences'
import { PriceBreakdown } from './price-breakdown'
import { saveCalculation } from '@/app/(protected)/calculadora/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DecimalInput } from '@/components/ui/decimal-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ShoppingCart, Heart, Zap, Printer, Package } from 'lucide-react'

// ============================================================
// Section header
// ============================================================

function SectionHeader({
  number,
  title,
  badge,
}: {
  number: number
  title: string
  badge?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center size-6 rounded-full bg-accent text-accent-foreground text-xs font-bold font-mono">
        {number}
      </span>
      <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {badge && (
        <span className="ml-auto text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
          {badge}
        </span>
      )}
    </div>
  )
}

// ============================================================
// Marketplace card
// ============================================================

function MarketplaceCard({
  selected,
  onClick,
  icon,
  name,
  desc,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  name: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-all cursor-pointer ${
        selected
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-muted-foreground hover:border-accent/50'
      }`}
    >
      <div className="text-lg">{icon}</div>
      <span className="text-xs font-semibold">{name}</span>
      <span className="text-[10px] opacity-70 leading-tight">{desc}</span>
    </button>
  )
}

// ============================================================
// Main Form
// ============================================================

interface CalculatorFormProps {
  initialData?: {
    id: string
    input: CalculationInput
    name: string
  } | null
}

export function CalculatorForm({ initialData }: CalculatorFormProps) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS)
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(initialData?.id ?? null)

  // Load preferences on mount
  useEffect(() => {
    setPrefs(loadPrefs())
    setMounted(true)
  }, [])

  // Save preferences when they change
  useEffect(() => {
    if (mounted) savePrefs(prefs)
  }, [prefs, mounted])

  // ---- State ----

  // Product type
  const [productType, setProductType] = useState<'3d' | 'normal'>('3d')
  const [supplierCost, setSupplierCost] = useState(0)
  const [normalMode, setNormalMode] = useState<'pv' | 'cf'>('pv')
  const [normalMargin, setNormalMargin] = useState(30)
  const [cfTargetPrice, setCfTargetPrice] = useState(0)
  const [cfMargin, setCfMargin] = useState(30)

  // Marketplace
  const [marketplaceType, setMarketplaceType] = useState<
    'none' | 'mercadolivre' | 'shopee'
  >('mercadolivre')
  const [mlAdType, setMlAdType] = useState<'classico' | 'premium'>('classico')
  const [mlParcelamento, setMlParcelamento] = useState(false)
  const [mlCategory, setMlCategory] = useState(ML_DEFAULT_CATEGORY)
  const [mlCustomRate, setMlCustomRate] = useState<number | null>(null)
  const [shopeeSellerType, setShopeeSellerType] = useState<'cpf' | 'cnpj'>(
    prefs.shopeeSellerType
  )
  const [shopeeCpfHighVolume, setShopeeCpfHighVolume] = useState(false)
  const [shopeeCampaign, setShopeeCampaign] = useState(false)
  const [shopeeCouponType, setShopeeCouponType] = useState<
    'none' | 'percent' | 'fixed'
  >('none')
  const [shopeeCouponValue, setShopeeCouponValue] = useState(0)

  // Shipping
  const [shippingWeightKg, setShippingWeightKg] = useState(0.3)
  const [mlFreteRapido, setMlFreteRapido] = useState(true)
  const [manualShippingEnabled, setManualShippingEnabled] = useState(false)
  const [manualShippingValue, setManualShippingValue] = useState(0)

  // Pricing
  const [pricingMode, setPricingMode] = useState<'sale-price' | 'margin'>(
    'sale-price'
  )
  const [salePrice, setSalePrice] = useState(0)
  const [marginPercent, setMarginPercent] = useState(prefs.marginPercent)

  // Promo
  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(prefs.promoDiscount)

  // Payment
  const [cardRatePercent, setCardRatePercent] = useState(prefs.cardRatePercent)
  const [pixDiscountPercent, setPixDiscountPercent] = useState(
    prefs.pixDiscountPercent
  )

  // Printer & Energy
  const [printerId, setPrinterId] = useState(prefs.printerId)
  const [customPrinterKw, setCustomPrinterKw] = useState(0.10)
  const [printHours, setPrintHours] = useState(0)
  const [printMinutes, setPrintMinutes] = useState(0)
  const [kwhPrice, setKwhPrice] = useState(prefs.kwhPrice)

  // Filament
  const [filamentPricePerKg, setFilamentPricePerKg] = useState(
    prefs.filamentPricePerKg
  )
  const [filamentWeightGrams, setFilamentWeightGrams] = useState(0)

  // Other costs
  const [taxPercent, setTaxPercent] = useState(prefs.taxPercent)
  const [packagingCost, setPackagingCost] = useState(prefs.packagingCost)
  const [otherCosts, setOtherCosts] = useState(0)

  // Labor (venda direta)
  const [laborCostPerHour, setLaborCostPerHour] = useState(
    prefs.laborCostPerHour
  )
  const [laborMinutes, setLaborMinutes] = useState(0)

  // Save
  const [saving, startSaving] = useTransition()
  const [saved, setSaved] = useState(false)

  // Sync from prefs when loaded
  useEffect(() => {
    if (mounted) {
      setFilamentPricePerKg(prefs.filamentPricePerKg)
      setKwhPrice(prefs.kwhPrice)
      setPackagingCost(prefs.packagingCost)
      setTaxPercent(prefs.taxPercent)
      setMarginPercent(prefs.marginPercent)
      setPromoDiscount(prefs.promoDiscount)
      setCardRatePercent(prefs.cardRatePercent)
      setPixDiscountPercent(prefs.pixDiscountPercent)
      setPrinterId(prefs.printerId)
      setLaborCostPerHour(prefs.laborCostPerHour)
      setShopeeSellerType(prefs.shopeeSellerType)
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load saved calculation for editing
  useEffect(() => {
    if (!initialData) return
    const d = initialData.input
    const mp = d.marketplace
    const pr = d.pricing
    const pm = d.payment
    const prm = d.promo

    setProductType(d.productType ?? '3d')
    setSupplierCost(d.supplierCost ?? 0)

    // Marketplace
    setMarketplaceType(mp?.type ?? 'mercadolivre')
    setMlAdType(mp?.mlAdType ?? 'classico')
    setMlParcelamento(mp?.mlParcelamento ?? false)
    setMlCategory(mp?.mlCategory ?? ML_DEFAULT_CATEGORY)
    setMlCustomRate(mp?.mlCustomRate ?? null)
    setShopeeSellerType(mp?.shopeeSellerType ?? 'cnpj')
    setShopeeCpfHighVolume(mp?.shopeeCpfHighVolume ?? false)
    setShopeeCampaign(mp?.shopeeCampaign ?? false)
    setShopeeCouponType(mp?.shopeeCouponType ?? 'none')
    setShopeeCouponValue(mp?.shopeeCouponValue ?? 0)

    // Shipping
    setShippingWeightKg(d.shippingWeightKg ?? 0.3)
    setMlFreteRapido(d.mlFreteRapido ?? true)
    setManualShippingEnabled(d.manualShipping !== null && d.manualShipping !== undefined)
    setManualShippingValue(d.manualShipping ?? 0)

    // Pricing
    setPricingMode(pr?.mode ?? 'sale-price')
    setSalePrice(pr?.salePrice ?? 0)
    setMarginPercent(pr?.marginPercent ?? 30)

    // Promo
    setPromoEnabled(prm?.enabled ?? false)
    setPromoDiscount(prm?.discountPercent ?? 10)

    // Payment
    setCardRatePercent(pm?.cardRatePercent ?? 0)
    setPixDiscountPercent(pm?.pixDiscountPercent ?? 5)

    // Printer & Energy
    setPrinterId(d.printerId ?? prefs.printerId)
    setCustomPrinterKw(d.customPrinterKw ?? 0.10)
    setPrintHours(d.printHours ?? 0)
    setPrintMinutes(d.printMinutes ?? 0)
    setKwhPrice(d.kwhPrice ?? prefs.kwhPrice)

    // Filament
    setFilamentPricePerKg(d.filamentPricePerKg ?? prefs.filamentPricePerKg)
    setFilamentWeightGrams(d.filamentWeightGrams ?? 0)

    // Other costs
    setTaxPercent(d.taxPercent ?? 0)
    setPackagingCost(d.packagingCost ?? 0)
    setOtherCosts(d.otherCosts ?? 0)

    // Labor
    setLaborCostPerHour(d.laborCostPerHour ?? prefs.laborCostPerHour)
    setLaborMinutes(d.laborMinutes ?? 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Derived ----

  const selectedPrinter = PRINTERS.find((p) => p.id === printerId)

  const mlCategoryObj = ML_CATEGORIES[mlCategory]
  const isCustomCategory = mlCategory === 'custom'

  const marketplace: MarketplaceConfig = useMemo(
    () => ({
      type: marketplaceType,
      mlAdType,
      mlParcelamento: mlAdType === 'premium' ? mlParcelamento : false,
      mlCategory: isCustomCategory ? undefined : mlCategory,
      mlCustomRate: isCustomCategory ? (mlCustomRate ?? undefined) : undefined,
      shopeeSellerType,
      shopeeCpfHighVolume,
      shopeeCampaign,
      shopeeCouponType,
      shopeeCouponValue,
    }),
    [
      marketplaceType,
      mlAdType,
      mlParcelamento,
      mlCategory,
      isCustomCategory,
      mlCustomRate,
      shopeeSellerType,
      shopeeCpfHighVolume,
      shopeeCampaign,
      shopeeCouponType,
      shopeeCouponValue,
    ]
  )

  const pricing: PricingMode = useMemo(
    () => ({
      mode: pricingMode,
      salePrice: pricingMode === 'sale-price' ? salePrice : undefined,
      marginPercent: pricingMode === 'margin' ? marginPercent : undefined,
    }),
    [pricingMode, salePrice, marginPercent]
  )

  const promo: PromoConfig = useMemo(
    () => ({ enabled: promoEnabled, discountPercent: promoDiscount }),
    [promoEnabled, promoDiscount]
  )

  const payment: PaymentConfig = useMemo(
    () => ({
      cardRatePercent: marketplaceType === 'none' ? cardRatePercent : 0,
      pixDiscountPercent: marketplaceType === 'none' ? pixDiscountPercent : 0,
    }),
    [cardRatePercent, pixDiscountPercent, marketplaceType]
  )

  const calculationInput: CalculationInput = useMemo(
    () => ({
      productType,
      pricing,
      promo,
      payment,
      marketplace,
      shippingWeightKg,
      mlFreteRapido,
      manualShipping: manualShippingEnabled ? manualShippingValue : null,
      printerId,
      customPrinterKw,
      printHours: productType === '3d' ? printHours : 0,
      printMinutes: productType === '3d' ? printMinutes : 0,
      kwhPrice,
      filamentPricePerKg,
      filamentWeightGrams: productType === '3d' ? filamentWeightGrams : 0,
      supplierCost: productType === 'normal' ? supplierCost : 0,
      taxPercent,
      packagingCost,
      otherCosts,
      laborCostPerHour,
      laborMinutes,
    }),
    [
      productType,
      pricing,
      promo,
      payment,
      marketplace,
      shippingWeightKg,
      mlFreteRapido,
      manualShippingEnabled,
      manualShippingValue,
      printerId,
      customPrinterKw,
      printHours,
      printMinutes,
      kwhPrice,
      filamentPricePerKg,
      filamentWeightGrams,
      supplierCost,
      taxPercent,
      packagingCost,
      otherCosts,
      laborCostPerHour,
      laborMinutes,
    ]
  )

  const result = useMemo(() => calculate(calculationInput), [calculationInput])

  // PV mode: calculate suggested sale price iteratively
  const pvSuggestedPrice = useMemo(() => {
    if (productType !== 'normal' || normalMode !== 'pv' || supplierCost <= 0) return 0
    return calculatePVSalePrice(supplierCost, normalMargin, calculationInput)
  }, [productType, normalMode, supplierCost, normalMargin, calculationInput])

  // CF mode: calculate max supplier cost
  const cfResult = useMemo(() => {
    if (productType !== 'normal' || normalMode !== 'cf' || cfTargetPrice <= 0) return null
    return calculateMaxSupplierCost(cfTargetPrice, cfMargin, calculationInput)
  }, [productType, normalMode, cfTargetPrice, cfMargin, calculationInput])

  // Auto-populate sale price when PV mode calculates a price
  useEffect(() => {
    if (productType === 'normal' && normalMode === 'pv' && pvSuggestedPrice > 0) {
      setPricingMode('sale-price')
      setSalePrice(pvSuggestedPrice)
    }
  }, [pvSuggestedPrice, productType, normalMode])

  // Auto-populate sale price when CF mode has a target price
  useEffect(() => {
    if (productType === 'normal' && normalMode === 'cf' && cfTargetPrice > 0) {
      setPricingMode('sale-price')
      setSalePrice(cfTargetPrice)
      // Also set the supplier cost to the max cost for full calculation
      if (cfResult && cfResult.maxCost > 0) {
        setSupplierCost(cfResult.maxCost)
      }
    }
  }, [cfTargetPrice, cfResult, productType, normalMode])

  // ---- Handlers ----

  // ---- Validation: required fields ----

  const missingFields = useMemo(() => {
    const m = new Set<string>()

    // Shipping required for ML
    if (marketplaceType === 'mercadolivre') {
      if (!manualShippingEnabled && shippingWeightKg <= 0) m.add('shippingWeight')
      if (manualShippingEnabled && manualShippingValue <= 0) m.add('manualShipping')
    }

    // Sale price required when in sale-price mode for 3D
    if (pricingMode === 'sale-price' && salePrice <= 0 && productType === '3d') {
      m.add('salePrice')
    }

    // 3D product: print time + filament required
    if (productType === '3d') {
      if (printHours <= 0 && printMinutes <= 0) m.add('printTime')
      if (filamentWeightGrams <= 0) m.add('filamentWeight')
    }

    // Normal product: supplier cost / target price required
    if (productType === 'normal') {
      if (normalMode === 'pv' && supplierCost <= 0) m.add('supplierCost')
      if (normalMode === 'cf' && cfTargetPrice <= 0) m.add('cfTargetPrice')
    }

    return m
  }, [
    marketplaceType, manualShippingEnabled, shippingWeightKg, manualShippingValue,
    pricingMode, salePrice, productType, printHours, printMinutes,
    filamentWeightGrams, normalMode, supplierCost, cfTargetPrice,
  ])

  function handleSave(productName: string) {
    setSaved(false)
    startSaving(async () => {
      const response = await saveCalculation({
        id: editingId ?? undefined,
        name: productName,
        salePrice: result.salePrice,
        profit: result.profit,
        marginPercent: result.marginPercent,
        marketplace: marketplaceType === 'none' ? null : marketplaceType,
        marketplaceFee: result.marketplaceTotalFee > 0 ? result.marketplaceTotalFee : null,
        inputData: calculationInput as unknown as Record<string, unknown>,
      })
      if (response.success) {
        if (response.id) setEditingId(response.id)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  // ---- Render ----

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Left Column - Form */}
      <div className="space-y-6">
        {/* Section 0: Product Type */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={0} title="Tipo de Produto" />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProductType('3d')}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-all cursor-pointer ${
                  productType === '3d'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted-foreground hover:border-accent/50'
                }`}
              >
                <Printer className="size-5" />
                <span className="text-xs font-semibold">Produto 3D</span>
                <span className="text-[10px] opacity-70">Impressora + filamento</span>
              </button>
              <button
                type="button"
                onClick={() => setProductType('normal')}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center transition-all cursor-pointer ${
                  productType === 'normal'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted-foreground hover:border-accent/50'
                }`}
              >
                <Package className="size-5" />
                <span className="text-xs font-semibold">Produto Normal</span>
                <span className="text-[10px] opacity-70">Comprado de fornecedor</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Marketplace */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={1} title="Marketplace" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              <MarketplaceCard
                selected={marketplaceType === 'mercadolivre'}
                onClick={() => setMarketplaceType('mercadolivre')}
                icon={<ShoppingCart className="size-5" />}
                name="Mercado Livre"
                desc="Clássico ou Premium"
              />
              <MarketplaceCard
                selected={marketplaceType === 'shopee'}
                onClick={() => setMarketplaceType('shopee')}
                icon={<Heart className="size-5" />}
                name="Shopee"
                desc="Tabela oficial 2026"
              />
              <MarketplaceCard
                selected={marketplaceType === 'none'}
                onClick={() => setMarketplaceType('none')}
                icon={<Zap className="size-5" />}
                name="Venda Direta"
                desc="Pix, cartão, personalizado"
              />
            </div>

            {/* ML Options */}
            {marketplaceType === 'mercadolivre' && (
              <div className="space-y-4 mt-4">
                {/* Ad type */}
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                    Tipo de anúncio
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setMlAdType('classico'); setMlParcelamento(false) }}
                      className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                        mlAdType === 'classico'
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <span className="text-sm font-semibold block">
                        Clássico
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        10-14% · sem parcelamento
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMlAdType('premium')}
                      className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                        mlAdType === 'premium'
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <span className="text-sm font-semibold block">
                        Premium
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        15-19% · até 18x sem juros
                      </span>
                    </button>
                  </div>
                  {mlAdType === 'premium' && (
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-sm">Parcelamento (até 18x)?</p>
                        <p className="text-[10px] text-muted-foreground">
                          +2,99% taxa de antecipação
                        </p>
                      </div>
                      <Switch
                        checked={mlParcelamento}
                        onCheckedChange={setMlParcelamento}
                      />
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                    Categoria (Clássico / Premium)
                  </Label>
                  <Select value={mlCategory} onValueChange={setMlCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ML_CATEGORIES).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          {cat.label} — {cat.classico}% / {cat.premium}%
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        Outra categoria (digitar taxa)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!isCustomCategory && mlCategoryObj && (
                    <p className="text-xs text-muted-foreground font-mono mt-1.5">
                      {mlAdType === 'classico'
                        ? `${mlCategoryObj.classico}% comissão`
                        : `${mlCategoryObj.premium}% comissão`}
                    </p>
                  )}
                  {isCustomCategory && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground">
                        Taxa de comissão (%)
                      </Label>
                      <DecimalInput
                        value={mlCustomRate ?? 12}
                        onValueChange={(v) => setMlCustomRate(v)}
                        className="mt-1 font-mono w-32"
                      />
                    </div>
                  )}
                </div>

                {/* Shipping */}
                <div className="border-t border-border pt-4">
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                    Custo de envio (Envios ML 2026)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Peso com embalagem (kg) *
                      </Label>
                      <DecimalInput
                        value={shippingWeightKg}
                        onValueChange={setShippingWeightKg}
                        className="mt-1 font-mono"
                        aria-invalid={missingFields.has('shippingWeight')}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Frete estimado
                      </Label>
                      <div className="mt-1 h-9 flex items-center px-3 rounded-md border border-border bg-secondary font-mono text-sm">
                        {result.shippingCost > 0
                          ? `R$ ${result.shippingCost.toFixed(2).replace('.', ',')}`
                          : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">
                          Oferecer frete rápido?
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Produtos R$19–78,99: custo maior, entrega mais rápida
                        </p>
                      </div>
                      <Switch
                        checked={mlFreteRapido}
                        onCheckedChange={setMlFreteRapido}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Digitar frete manualmente</p>
                        <p className="text-[10px] text-muted-foreground">
                          Substitui o cálculo automático
                        </p>
                      </div>
                      <Switch
                        checked={manualShippingEnabled}
                        onCheckedChange={setManualShippingEnabled}
                      />
                    </div>
                    {manualShippingEnabled && (
                      <DecimalInput
                        placeholder="Valor do frete (R$)"
                        value={manualShippingValue}
                        onValueChange={setManualShippingValue}
                        hideZero
                        className="font-mono"
                        aria-invalid={missingFields.has('manualShipping')}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shopee Options */}
            {marketplaceType === 'shopee' && (
              <div className="space-y-4 mt-4">
                {/* Seller type */}
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                    Tipo de vendedor
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShopeeSellerType('cnpj')}
                      className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                        shopeeSellerType === 'cnpj'
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
                      onClick={() => setShopeeSellerType('cpf')}
                      className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                        shopeeSellerType === 'cpf'
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <span className="text-sm font-semibold block">CPF</span>
                      <span className="text-[10px] text-muted-foreground">
                        +R$3/item (baixo vol.)
                      </span>
                    </button>
                  </div>
                </div>

                {shopeeSellerType === 'cpf' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">
                        CPF com +450 pedidos/90 dias?
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Adiciona +R$3/item (baixo volume não paga)
                      </p>
                    </div>
                    <Switch
                      checked={shopeeCpfHighVolume}
                      onCheckedChange={setShopeeCpfHighVolume}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Campanha de destaque?</p>
                    <p className="text-[10px] text-muted-foreground">
                      +2,5% de comissão durante a campanha
                    </p>
                  </div>
                  <Switch
                    checked={shopeeCampaign}
                    onCheckedChange={setShopeeCampaign}
                  />
                </div>

                {/* Cupom próprio */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Cupom de desconto próprio?</p>
                    <p className="text-[10px] text-muted-foreground">
                      Desconto bancado por você
                    </p>
                  </div>
                  <Switch
                    checked={shopeeCouponType !== 'none'}
                    onCheckedChange={(v) =>
                      setShopeeCouponType(v ? 'percent' : 'none')
                    }
                  />
                </div>
                {shopeeCouponType !== 'none' && (
                  <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShopeeCouponType('percent')}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                          shopeeCouponType === 'percent'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border text-muted-foreground hover:border-accent/50'
                        }`}
                      >
                        % desconto
                      </button>
                      <button
                        type="button"
                        onClick={() => setShopeeCouponType('fixed')}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                          shopeeCouponType === 'fixed'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border text-muted-foreground hover:border-accent/50'
                        }`}
                      >
                        R$ fixo
                      </button>
                    </div>
                    <DecimalInput
                      placeholder={
                        shopeeCouponType === 'percent'
                          ? 'Desconto em %'
                          : 'Desconto em R$'
                      }
                      value={shopeeCouponValue}
                      onValueChange={setShopeeCouponValue}
                      hideZero
                      className="font-mono"
                    />
                  </div>
                )}

                {/* Fee summary */}
                <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
                  <p className="text-muted-foreground font-mono">
                    Taxas Shopee 2026 (março):
                  </p>
                  <p>
                    Até R$79,99 → <strong>20% + R$4</strong>
                  </p>
                  <p>
                    R$80-99,99 → <strong>14% + R$16</strong>
                  </p>
                  <p>
                    R$100-199,99 → <strong>14% + R$20</strong>
                  </p>
                  <p>
                    R$200-499,99 → <strong>14% + R$26</strong>
                  </p>
                  <p>
                    R$500+ → <strong>14% + R$26</strong>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Teto de comissão: R$100/item
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Price & Margin */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={2} title="Preço & Margem" />
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                  Modo de precificação
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPricingMode('sale-price')}
                    className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                      pricingMode === 'sale-price'
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <span className="text-sm font-semibold block">
                      Digitar preço de venda
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode('margin')}
                    className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                      pricingMode === 'margin'
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <span className="text-sm font-semibold block">
                      Margem de contribuição
                    </span>
                  </button>
                </div>
              </div>

              {pricingMode === 'sale-price' ? (
                <div>
                  <Label>Preço de venda (R$) *</Label>
                  <DecimalInput
                    value={salePrice}
                    onValueChange={setSalePrice}
                    hideZero
                    placeholder="0,00"
                    className="mt-1.5 font-mono text-lg"
                    aria-invalid={missingFields.has('salePrice')}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Margem desejada</Label>
                    <span className="font-mono text-accent text-lg font-bold">
                      {marginPercent}%
                    </span>
                  </div>
                  <Slider
                    value={[marginPercent]}
                    onValueChange={([v]) => setMarginPercent(v)}
                    min={5}
                    max={80}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    % sobre o preço de venda
                  </p>
                </div>
              )}

              {/* Promo */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Calcular preço com promoção?</p>
                  <p className="text-[10px] text-muted-foreground">
                    Preço com margem para absorver desconto
                  </p>
                </div>
                <Switch
                  checked={promoEnabled}
                  onCheckedChange={setPromoEnabled}
                />
              </div>
              {promoEnabled && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Desconto da promoção (%)
                  </Label>
                  <DecimalInput
                    value={promoDiscount}
                    onValueChange={setPromoDiscount}
                    integer
                    className="mt-1 font-mono w-24"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Printer & Energy (3D only) */}
        {productType === '3d' && (
          <Card className="border-border">
            <CardContent className="pt-6">
              <SectionHeader
                number={3}
                title="Impressora & Energia"
                badge="Bambu Lab + outras"
              />
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                    Modelo
                  </Label>
                  <Select value={printerId} onValueChange={setPrinterId}>
                    <SelectTrigger>
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
                  {printerId === CUSTOM_PRINTER_ID && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground">
                        Consumo médio (kWh/h)
                      </Label>
                      <DecimalInput
                        value={customPrinterKw}
                        onValueChange={setCustomPrinterKw}
                        className="mt-1 font-mono w-36"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      Horas de impressão *
                    </Label>
                    <DecimalInput
                      value={printHours}
                      onValueChange={setPrintHours}
                      integer
                      className="mt-1.5 font-mono"
                      aria-invalid={missingFields.has('printTime')}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                      Minutos de impressão
                    </Label>
                    <DecimalInput
                      value={printMinutes}
                      onValueChange={setPrintMinutes}
                      integer
                      className="mt-1.5 font-mono"
                      aria-invalid={missingFields.has('printTime')}
                    />
                  </div>
                </div>

                <div>
                  <Label>Valor do kWh (R$)</Label>
                  <DecimalInput
                    value={kwhPrice}
                    onValueChange={setKwhPrice}
                    className="mt-1.5 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Média nacional ≈ R$0,85 · verifique sua conta
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 4: Filament (3D only) */}
        {productType === '3d' && (
          <Card className="border-border">
            <CardContent className="pt-6">
              <SectionHeader number={4} title="Filamento" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Custo do filamento
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      R$
                    </span>
                    <DecimalInput
                      value={filamentPricePerKg}
                      onValueChange={setFilamentPricePerKg}
                      className="font-mono pl-8 pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      /kg
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Peso usado na peça *
                  </Label>
                  <div className="relative mt-1.5">
                    <DecimalInput
                      value={filamentWeightGrams}
                      onValueChange={setFilamentWeightGrams}
                      hideZero
                      className="font-mono pr-8"
                      placeholder="0"
                      aria-invalid={missingFields.has('filamentWeight')}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      g
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Custo = (R$/kg ÷ 1000) × gramas · inclua desperdício se quiser
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section 3: Fornecedor (Normal product only) */}
        {productType === 'normal' && (
          <Card className="border-border">
            <CardContent className="pt-6">
              <SectionHeader number={3} title="Fornecedor" badge="produto normal" />
              {/* Mode selector: PV / CF */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setNormalMode('pv')}
                  className={`rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    normalMode === 'pv'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  <span className="text-xs font-semibold block">Calcular Preço de Venda</span>
                  <span className="text-[10px] opacity-70">Modo PV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNormalMode('cf')}
                  className={`rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    normalMode === 'cf'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  <span className="text-xs font-semibold block">Calcular Custo Alvo do Produto</span>
                  <span className="text-[10px] opacity-70">Modo CF</span>
                </button>
              </div>

              {normalMode === 'pv' && (
                <div className="space-y-4">
                  <div>
                    <Label>Custo do fornecedor (R$) *</Label>
                    <DecimalInput
                      value={supplierCost}
                      onValueChange={setSupplierCost}
                      hideZero
                      placeholder="0,00"
                      className="mt-1.5 font-mono text-lg"
                      aria-invalid={missingFields.has('supplierCost')}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Margem desejada</Label>
                      <span className="font-mono text-accent text-lg font-bold">
                        {normalMargin}%
                      </span>
                    </div>
                    <Slider
                      value={[normalMargin]}
                      onValueChange={([v]) => setNormalMargin(v)}
                      min={5}
                      max={80}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      % sobre o preço de venda (já descontadas taxas)
                    </p>
                  </div>
                  {/* Show calculated price */}
                  {supplierCost > 0 && pvSuggestedPrice > 0 && (
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Preço de venda sugerido</p>
                      <p className="font-mono text-lg font-bold text-accent">
                        R$ {pvSuggestedPrice.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Preço automaticamente preenchido na seção Preço & Margem
                      </p>
                    </div>
                  )}
                </div>
              )}

              {normalMode === 'cf' && (
                <div className="space-y-4">
                  <div>
                    <Label>Preço de venda alvo (R$) *</Label>
                    <DecimalInput
                      value={cfTargetPrice}
                      onValueChange={setCfTargetPrice}
                      hideZero
                      placeholder="0,00"
                      className="mt-1.5 font-mono text-lg"
                      aria-invalid={missingFields.has('cfTargetPrice')}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Margem desejada</Label>
                      <span className="font-mono text-accent text-lg font-bold">
                        {cfMargin}%
                      </span>
                    </div>
                    <Slider
                      value={[cfMargin]}
                      onValueChange={([v]) => setCfMargin(v)}
                      min={5}
                      max={80}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  {/* Show max supplier cost result */}
                  {cfResult && cfTargetPrice > 0 && (
                    <div className="space-y-3">
                      <div className={`border rounded-lg p-3 ${cfResult.maxCost > 0 ? 'bg-accent/5 border-accent/20' : 'bg-destructive/5 border-destructive/20'}`}>
                        <p className="text-xs text-muted-foreground">Custo máximo do fornecedor</p>
                        <p className={`font-mono text-lg font-bold ${cfResult.maxCost > 0 ? 'text-accent' : 'text-destructive'}`}>
                          {cfResult.maxCost > 0
                            ? `R$ ${cfResult.maxCost.toFixed(2).replace('.', ',')}`
                            : 'Inviável'}
                        </p>
                        {cfResult.maxCost <= 0 && (
                          <p className="text-[10px] text-destructive mt-1">
                            Taxas + margem excedem o preço de venda
                          </p>
                        )}
                      </div>
                      {/* Breakdown */}
                      {cfResult.breakdown.length > 0 && (
                        <div className="bg-secondary/50 rounded-lg p-3 text-xs space-y-1">
                          <p className="text-muted-foreground font-mono mb-2">Deduções do preço de venda:</p>
                          {cfResult.breakdown.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-mono">R$ {item.value.toFixed(2).replace('.', ',')}</span>
                            </div>
                          ))}
                          <div className="border-t border-border pt-1 mt-1 flex justify-between font-semibold">
                            <span>Sobra para fornecedor</span>
                            <span className="font-mono">R$ {cfResult.maxCost.toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section 4/5: Other costs */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <SectionHeader number={productType === '3d' ? 5 : 4} title="Demais custos" badge="opcional" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Imposto (alíquota)
                  </Label>
                  <div className="relative mt-1.5">
                    <DecimalInput
                      value={taxPercent}
                      onValueChange={setTaxPercent}
                      className="font-mono pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Simples: 4-19,5% · MEI isento
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Embalagem / acabamento
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                      R$
                    </span>
                    <DecimalInput
                      value={packagingCost}
                      onValueChange={setPackagingCost}
                      hideZero
                      className="font-mono pl-8"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Outros custos (R$)
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                    R$
                  </span>
                  <DecimalInput
                    value={otherCosts}
                    onValueChange={setOtherCosts}
                    hideZero
                    className="font-mono pl-8"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Labor (only for venda direta) */}
              {marketplaceType === 'none' && (
                <div className="border-t border-border pt-4">
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                    Mão de obra
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Custo/hora (R$)
                      </Label>
                      <DecimalInput
                        value={laborCostPerHour}
                        onValueChange={setLaborCostPerHour}
                        className="mt-1 font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Tempo (min)
                      </Label>
                      <DecimalInput
                        value={laborMinutes}
                        onValueChange={setLaborMinutes}
                        integer
                        className="mt-1 font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    R$35/h ≈ referência mercado maker SP · ajuste conforme sua
                    especialização
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Payment - only for Venda Direta */}
        {marketplaceType === 'none' && (
          <Card className="border-border">
            <CardContent className="pt-6">
              <SectionHeader number={productType === '3d' ? 6 : 5} title="Forma de pagamento" />
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  O <strong>preço base é sempre o Pix</strong> — sem taxa. O
                  cartão embute a taxa da maquininha no preço cobrado do cliente.
                </p>

                <div>
                  <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                    Taxa do cartão
                  </Label>
                  {(() => {
                    const PRESET_RATES = [1.99, 2.99, 4.49, 5.49, 6.49, 7.99, 11.99]
                    const isPresetRate = PRESET_RATES.includes(cardRatePercent)
                    return (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {/* Row 1: Débito + Crédito à vista + 2x + 3x */}
                          <button type="button" onClick={() => setCardRatePercent(1.99)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              cardRatePercent === 1.99 ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">Débito</span>
                            <span className="text-[10px] text-muted-foreground">1,99%</span>
                          </button>
                          <button type="button" onClick={() => setCardRatePercent(2.99)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              cardRatePercent === 2.99 ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">Crédito</span>
                            <span className="text-[10px] text-muted-foreground">2,99%</span>
                          </button>
                          <button type="button" onClick={() => setCardRatePercent(4.49)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              cardRatePercent === 4.49 ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">2x</span>
                            <span className="text-[10px] text-muted-foreground">4,49%</span>
                          </button>
                          <button type="button" onClick={() => setCardRatePercent(5.49)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              cardRatePercent === 5.49 ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">3x</span>
                            <span className="text-[10px] text-muted-foreground">5,49%</span>
                          </button>

                          {/* Row 2: 4x + 6x + 12x + Custom */}
                          <button type="button" onClick={() => setCardRatePercent(6.49)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              cardRatePercent === 6.49 ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">4x</span>
                            <span className="text-[10px] text-muted-foreground">6,49%</span>
                          </button>
                          <button type="button" onClick={() => setCardRatePercent(7.99)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              cardRatePercent === 7.99 ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">6x</span>
                            <span className="text-[10px] text-muted-foreground">7,99%</span>
                          </button>
                          <button type="button" onClick={() => setCardRatePercent(11.99)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              cardRatePercent === 11.99 ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">12x</span>
                            <span className="text-[10px] text-muted-foreground">11,99%</span>
                          </button>
                          <button type="button" onClick={() => setCardRatePercent(0)}
                            className={`rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                              !isPresetRate ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                            }`}>
                            <span className="text-xs font-semibold block">Outra</span>
                            <span className="text-[10px] text-muted-foreground">digitar</span>
                          </button>
                        </div>
                        {!isPresetRate && (
                          <DecimalInput
                            value={cardRatePercent}
                            onValueChange={setCardRatePercent}
                            hideZero
                            placeholder="0,00"
                            className="mt-2 font-mono w-32"
                          />
                        )}
                      </>
                    )
                  })()}
                  {cardRatePercent > 0 && (
                    <p className="text-xs text-muted-foreground font-mono mt-1.5">
                      Taxa cartão: {cardRatePercent.toFixed(2).replace('.', ',')}%
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">Desconto para pagamento no Pix</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Desconto Pix (% menor que cartão)
                      </Label>
                      <div className="relative mt-1">
                        <DecimalInput
                          value={pixDiscountPercent}
                          onValueChange={setPixDiscountPercent}
                          className="font-mono pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                          %
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Padrão 5% · exclusão aproximada da taxa de maquininha
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Preço no Pix (calculado)
                      </Label>
                      <div className="mt-1 h-9 flex items-center px-3 rounded-md border border-border bg-secondary font-mono text-sm text-accent">
                        {result.pixPrice > 0
                          ? `R$ ${result.pixPrice.toFixed(2).replace('.', ',')}`
                          : 'R$ —'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Price Breakdown */}
      <div className="lg:order-last">
        <PriceBreakdown
          result={result}
          onSave={handleSave}
          saving={saving}
          saved={saved}
          printTimeHours={printHours + printMinutes / 60}
          marketplaceType={marketplaceType}
          editingName={initialData?.name ?? null}
        />
      </div>
    </div>
  )
}
