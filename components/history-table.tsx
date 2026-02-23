'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { deleteCalculation } from '@/app/(protected)/historico/actions'

interface Calculation {
  id: string
  name: string
  final_price: number
  marketplace: string | null
  created_at: string | null
  materials: { name: string } | null
  machines: { name: string } | null
}

interface HistoryTableProps {
  calculations: Calculation[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function marketplaceLabel(marketplace: string | null): string {
  switch (marketplace) {
    case 'mercado_livre':
      return 'ML'
    case 'shopee':
      return 'Shopee'
    case 'direct':
    default:
      return 'Direto'
  }
}

function marketplaceBadgeClass(marketplace: string | null): string {
  switch (marketplace) {
    case 'mercado_livre':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    case 'shopee':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    default:
      return 'bg-accent/10 text-accent border-accent/20'
  }
}

export function HistoryTable({ calculations }: HistoryTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      await deleteCalculation(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
      router.refresh()
    })
  }

  function openDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Nome da peca</TableHead>
              <TableHead className="hidden sm:table-cell">Material</TableHead>
              <TableHead>Preco Final</TableHead>
              <TableHead className="hidden md:table-cell">Marketplace</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="w-[50px]">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calculations.map((calc) => (
              <TableRow key={calc.id} className="border-border">
                <TableCell className="font-medium">{calc.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {calc.materials?.name || '\u2014'}
                </TableCell>
                <TableCell className="font-mono text-accent font-semibold">
                  {formatPrice(calc.final_price)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={marketplaceBadgeClass(calc.marketplace)}>
                    {marketplaceLabel(calc.marketplace)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">
                  {formatDate(calc.created_at)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openDelete(calc.id)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao nao pode ser desfeita. O calculo sera removido permanentemente.
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
    </>
  )
}
