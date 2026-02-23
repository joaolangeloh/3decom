'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { MaterialFormDialog } from '@/components/material-form-dialog'
import { deleteMaterial } from '@/app/(protected)/materiais/actions'
import type { Tables } from '@/lib/database.types'

interface MaterialCardProps {
  material: Tables<'materials'>
}

export function MaterialCard({ material }: MaterialCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deleteMaterial(material.id)
      setDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{material.name}</h3>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent/20 shrink-0">
          {material.type}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Preco/kg</span>
          <p className="font-mono font-medium">
            R$ {material.price_per_kg.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Densidade</span>
          <p className="font-mono font-medium">
            {material.density.toFixed(2)} g/cm3
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
        <MaterialFormDialog material={material} />

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
                Essa acao nao pode ser desfeita. O material &quot;{material.name}&quot; sera removido permanentemente.
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
