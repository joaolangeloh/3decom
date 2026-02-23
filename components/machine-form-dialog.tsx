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
  createMachine,
  updateMachine,
} from '@/app/(protected)/maquinas/actions'
import type { Tables } from '@/lib/database.types'

interface MachineFormDialogProps {
  machine?: Tables<'machines'>
}

export function MachineFormDialog({ machine }: MachineFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!machine

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen) {
      setError(null)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = isEdit
        ? await updateMachine(machine.id, formData)
        : await createMachine(formData)

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
            Adicionar Maquina
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Maquina' : 'Nova Maquina'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informacoes da maquina.'
              : 'Adicione uma nova impressora 3D.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Ender 3 V2, Bambu Lab P1S"
              defaultValue={machine?.name || ''}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="power_consumption_watts">Consumo (W)</Label>
              <Input
                id="power_consumption_watts"
                name="power_consumption_watts"
                type="number"
                step="1"
                min="0"
                placeholder="350"
                defaultValue={machine?.power_consumption_watts || ''}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hourly_cost">Custo/hora (R$)</Label>
              <Input
                id="hourly_cost"
                name="hourly_cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="1.50"
                defaultValue={machine?.hourly_cost || ''}
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
                  : 'Criar Maquina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
