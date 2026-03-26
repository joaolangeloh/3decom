'use client'

import type { Amazon3DSettings } from '@/types/calculator-3d'
import { AMAZON_3D_CATEGORIES, AMAZON_FBA_FEE_TABLE, AMAZON_INSTALLMENT_FEE_PCT, AMAZON_INSTALLMENT_MIN_PRICE } from '@/lib/calculator-3d-config'
import { Card } from '@/components/ui/card'

interface AmazonConfig3DProps {
  settings: Amazon3DSettings
  onUpdate: <K extends keyof Amazon3DSettings>(key: K, value: Amazon3DSettings[K]) => void
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-[23px] rounded-xl transition-colors flex-shrink-0 ${on ? 'bg-accent' : 'bg-border'}`}
    >
      <div className={`absolute top-[3px] left-[3px] w-[17px] h-[17px] rounded-full bg-white transition-transform ${on ? 'translate-x-[19px]' : ''}`} />
    </button>
  )
}

export function AmazonConfig3D({ settings, onUpdate }: AmazonConfig3DProps) {
  const selectedCat = AMAZON_3D_CATEGORIES.find((c) => c.id === settings.categoryId) ??
    AMAZON_3D_CATEGORIES[AMAZON_3D_CATEGORIES.length - 1]

  return (
    <div className="space-y-4 mt-4">
      {/* Fulfillment type */}
      <label className="block text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
        Tipo de fulfillment
      </label>
      <div className="grid grid-cols-2 gap-2">
        {([
          { key: 'fba' as const, label: 'FBA', desc: 'Fulfillment by Amazon' },
          { key: 'dba' as const, label: 'DBA', desc: 'Delivery by Amazon' },
        ]).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onUpdate('fulfillmentType', opt.key)}
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
              settings.fulfillmentType === opt.key
                ? 'border-[#ff9900] bg-[#ff9900]/10'
                : 'border-border hover:border-[#ff9900]/50'
            }`}
          >
            <span className="text-sm font-semibold block">{opt.label}</span>
            <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
          </button>
        ))}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
          Categoria do produto
        </label>
        <select
          value={settings.categoryId}
          onChange={(e) => onUpdate('categoryId', e.target.value)}
          className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-sm font-mono text-foreground focus:border-[#ff9900] outline-none"
        >
          {AMAZON_3D_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} - {cat.commissionPct}%
            </option>
          ))}
        </select>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">
          Comissao: {selectedCat.commissionPct}%
          {selectedCat.minCommission > 1 ? ` (min R$${selectedCat.minCommission.toFixed(2)})` : ''}
        </p>
      </div>

      {/* FBA Fees info */}
      {settings.fulfillmentType === 'fba' && (
        <div className="bg-[#ff9900]/5 border border-[#ff9900]/20 rounded-lg p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#ff9900] mb-2">Taxas FBA por faixa de preco</div>
          <div className="space-y-1">
            {AMAZON_FBA_FEE_TABLE.slice(0, 4).map((tier, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>R${tier.minPrice.toFixed(0)}-R${tier.maxPrice === Infinity ? '...' : tier.maxPrice.toFixed(0)}</span>
                <span className="text-foreground">
                  R${(tier.logisticsFee + tier.collectionFee + tier.storageFee).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="text-[10px] text-muted-foreground font-mono mt-1">
              Logistica + Coleta + Armazenamento
            </div>
          </div>
        </div>
      )}

      {/* Installment toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <span className="text-sm text-muted-foreground">Parcelamento habilitado?</span>
          <span className="text-[10px] text-muted-foreground block font-mono">
            +{AMAZON_INSTALLMENT_FEE_PCT}% em produtos acima de R${AMAZON_INSTALLMENT_MIN_PRICE}
          </span>
        </div>
        <Toggle
          on={settings.installmentsEnabled}
          onToggle={() => onUpdate('installmentsEnabled', !settings.installmentsEnabled)}
        />
      </div>
    </div>
  )
}
