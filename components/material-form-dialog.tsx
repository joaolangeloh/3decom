'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createMaterial,
  updateMaterial,
} from '@/app/(protected)/materiais/actions'
import type { Tables } from '@/lib/database.types'

const MATERIAL_TYPES = ['PLA', 'ABS', 'PETG', 'TPU', 'Resina', 'Nylon', 'Outro'] as const

const DEFAULT_DENSITIES: Record<string, number> = {
  PLA: 1.24,
  ABS: 1.04,
  PETG: 1.27,
  TPU: 1.21,
  Resina: 1.1,
  Nylon: 1.14,
  Outro: 1.0,
}

interface MaterialFormDialogProps {
  material?: Tables<'materials'>
}

export function MaterialFormDialog({ material }: MaterialFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!material

  const [type, setType] = useState(material?.type || 'PLA')
  const [density, setDensity] = useState(
    material?.density?.toString() || DEFAULT_DENSITIES['PLA'].toString()
  )

  function handleTypeChange(newType: string) {
    setType(newType)
    if (!material) {
      setDensity((DEFAULT_DENSITIES[newType] ?? 1.0).toString())
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen) {
      setError(null)
      setType(material?.type || 'PLA')
      setDensity(
        material?.density?.toString() || DEFAULT_DENSITIES['PLA'].toString()
      )
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('type', type)
    formData.set('density', density)

    startTransition(async () => {
      const result = isEdit
        ? await updateMaterial(material.id, formData)
        : await createMaterial(formData)

      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon-xs">
            <Pencil className="size-3.5" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Adicionar Material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Material' : 'Novo Material'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informacoes do material.'
              : 'Adicione um novo material de impressao.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: PLA Branco 1kg"
              defaultValue={material?.name || ''}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price_per_kg">Preco por kg (R$)</Label>
              <Input
                id="price_per_kg"
                name="price_per_kg"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={material?.price_per_kg || ''}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="density">Densidade (g/cm3)</Label>
              <Input
                id="density"
                name="density"
                type="number"
                step="0.01"
                min="0"
                placeholder="1.24"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Salvando...'
                : isEdit
                  ? 'Salvar Alteracoes'
                  : 'Criar Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
