import { useState } from 'react'
import { Check, Layers, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ConfirmDelete } from '@/components/ConfirmDelete'
import {
  useCreateAreaMutation,
  useRemoveAreaMutation,
  useUpdateAreaMutation
} from '@/hooks/useContentMutations'
import type { AreaResponse } from '@/types/api'

/**
 * Áreas são poucas e mudam raramente, então não ocupam espaço na árvore — o
 * CRUD delas vive neste diálogo.
 *
 * `areas.name` não é traduzido (é termo técnico: HTML, CSS, JavaScript), então
 * não há mapa de idiomas aqui — ver a nota sobre `area_translations` em
 * api/CLAUDE.md.
 */
export function AreaManagerDialog ({ areas }: { areas: AreaResponse[] }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

  const createArea = useCreateAreaMutation()
  const updateArea = useUpdateAreaMutation()
  const removeArea = useRemoveAreaMutation()

  function startEditing (area: AreaResponse) {
    setEditingId(area.id)
    setEditingName(area.name)
  }

  function commitEditing () {
    const name = editingName.trim()
    if (editingId !== null && name.length > 0) {
      updateArea.mutate({ id: editingId, body: { name } })
    }
    setEditingId(null)
  }

  function createFromInput () {
    const name = newName.trim()
    if (name.length === 0) {
      return
    }
    createArea.mutate({ name })
    setNewName('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Layers className="size-3.5" /> Áreas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Áreas</DialogTitle>
          <DialogDescription>
            O app associa ícone e imagem a cada área <strong>por posição</strong> na lista, não por
            id — criar ou remover áreas muda essa associação.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-1">
          {areas.map((area) => (
            <li key={area.id} className="flex items-center gap-1 rounded-md px-1 py-1 hover:bg-accent/40">
              {editingId === area.id ? (
                <>
                  <Input
                    autoFocus
                    value={editingName}
                    onChange={(event) => { setEditingName(event.target.value) }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitEditing()
                      if (event.key === 'Escape') setEditingId(null)
                    }}
                    className="h-8"
                  />
                  <Button variant="ghost" size="icon" className="size-8" title="Salvar" onClick={commitEditing}>
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    title="Cancelar"
                    onClick={() => { setEditingId(null) }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 truncate px-2 text-sm">{area.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    title="Renomear"
                    onClick={() => { startEditing(area) }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <ConfirmDelete
                    title="Remover esta área?"
                    description={
                      <>
                        <p>
                          <strong>{area.name}</strong> será removida com todos os seus módulos,
                          lições, atividades e traduções.
                        </p>
                        <p>
                          Se alguma lição já tiver progresso de usuário, a API recusa a remoção.
                        </p>
                      </>
                    }
                    onConfirm={() => { removeArea.mutate(area.id) }}
                    trigger={
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" title="Remover">
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                  />
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Input
            value={newName}
            placeholder="Nome da nova área"
            onChange={(event) => { setNewName(event.target.value) }}
            onKeyDown={(event) => { if (event.key === 'Enter') createFromInput() }}
            className="h-9"
          />
          <Button size="sm" className="gap-1" onClick={createFromInput} disabled={newName.trim().length === 0}>
            <Plus className="size-3.5" /> Criar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
