import { Boxes } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ExportDialog } from '@/components/export/ExportDialog'
import { AreaManagerDialog } from '@/components/AreaManagerDialog'
import { ContentVersionDialog } from '@/components/ContentVersionDialog'
import type { AreaResponse, ContentModule } from '@/types/api'
import type { ExportDocument } from '@/lib/exportDocument'

interface AppHeaderProps {
  areas: AreaResponse[];
  areaId: number | null;
  areaName: string;
  modules: ContentModule[];
  onAreaChange: (areaId: number) => void;
  onPreparePrint: (document: ExportDocument | null) => void;
}

export function AppHeader ({
  areas,
  areaId,
  areaName,
  modules,
  onAreaChange,
  onPreparePrint
}: AppHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3 print-hidden">
      <div className="flex items-center gap-2 pr-2">
        <Boxes className="size-5 text-primary" />
        <span className="text-sm font-semibold tracking-tight">Codap · Conteúdo</span>
      </div>

      <Select
        // String vazia, nunca `undefined`: o Radix trocaria de não-controlado
        // para controlado quando a primeira área é selecionada, e avisa no console.
        value={areaId === null ? '' : String(areaId)}
        onValueChange={(value) => { onAreaChange(Number(value)) }}
      >
        <SelectTrigger className="w-56" aria-label="Área">
          <SelectValue placeholder="Selecione uma área" />
        </SelectTrigger>
        <SelectContent>
          {areas.map((area) => (
            <SelectItem key={area.id} value={String(area.id)}>
              {area.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <AreaManagerDialog areas={areas} />
        <ContentVersionDialog />
        <ExportDialog
          areaName={areaName}
          modules={modules}
          onPreparePrint={onPreparePrint}
        />
      </div>
    </header>
  )
}
