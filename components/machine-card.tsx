'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { MachineFormDialog } from '@/components/machine-form-dialog'
import { deleteMachine } from '@/app/(protected)/maquinas/actions'
import type { Tables } from '@/lib/database.types'

interface MachineCardProps {
  machine: Tables<'machines'>
}

export function MachineCard({ machine }: MachineCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deleteMachine(machine.id)
      setDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold truncate">{machine.name}</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Consumo</span>
          <p className="font-mono font-medium">
            {machine.power_consumption_watts} W
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Custo/hora</span>
          <p className="font-mono font-medium">
            R$ {machine.hourly_cost.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
        <MachineFormDialog machine={machine} />

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa acao nao pode ser desfeita. A maquina &quot;{machine.name}&quot; sera removida permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Removendo...' : 'Remover'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
