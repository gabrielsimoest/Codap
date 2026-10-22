import { type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

interface ConfirmDeleteProps {
  trigger: ReactNode;
  title: string;
  /** O que exatamente será apagado em cascata — sempre explícito, nunca genérico. */
  description: ReactNode;
  onConfirm: () => void;
}

/**
 * Confirmação de remoção.
 *
 * A API apaga em cascata (um módulo leva junto lições, atividades e traduções),
 * então o texto precisa dizer o que some — um "tem certeza?" genérico esconde
 * justamente a parte perigosa. O 409 de progresso de usuário continua sendo a
 * rede de segurança do servidor; isto é a da interface.
 */
export function ConfirmDelete ({ trigger, title, description, onConfirm }: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
