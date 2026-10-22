import { useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch, type Control } from 'react-hook-form'
import { Play, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { HighlightField } from './HighlightField'
import {
  PLAYGROUND_LANGUAGES,
  countBlanks,
  type CodePlaygroundContentForm
} from '@/lib/activitySchemas'
import { PLAYGROUND_MESSAGE, buildPlaygroundTestDocument, fillBlanks } from '@/lib/playgroundDocument'

/** Mesmo prazo do app: sem resposta nesse tempo, a execução é dada como travada. */
const TEST_TIMEOUT_MS = 4000

type TestState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'timeout' }
  | { status: 'done', result: { passed: boolean, message: string } | null, entries: { type: string, message: string }[] }

const SUPPORT_FIELDS = [
  { key: 'html', language: 'HTML', label: 'HTML de apoio' },
  { key: 'css', language: 'CSS', label: 'CSS de apoio' },
  { key: 'js', language: 'JavaScript', label: 'JavaScript de apoio' }
] as const

/**
 * Formulário de uma atividade `code_playground`, espelhando
 * `CodePlaygroundActivityContent`.
 *
 * O ponto central é o **Testar**: roda o exercício com a solução de referência
 * num `<iframe sandbox="allow-scripts">` — sem acesso ao dashboard nem à rede
 * (CSP) — e mostra a prévia, o console e o veredito do `checkScript`. Sem isso,
 * quem autora só descobriria um script de correção quebrado no celular.
 */
export function CodePlaygroundFields () {
  const form = useFormContext<CodePlaygroundContentForm>()
  const control = form.control as Control<CodePlaygroundContentForm>

  const question = useWatch({ control, name: 'question' })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []
  const codeLanguage = useWatch({ control, name: 'codeLanguage' }) ?? 'CSS'
  const code = useWatch({ control, name: 'code' }) ?? ''
  const blocks = useWatch({ control, name: 'blocks' }) ?? []
  const solution = useWatch({ control, name: 'solution' }) ?? []

  const blanks = countBlanks(code)
  const errors = form.formState.errors

  // Uma entrada de solução por lacuna (até 3), preservando o que já foi digitado.
  useEffect(() => {
    const target = Math.min(Math.max(blanks, 1), 3)
    const current = form.getValues('solution') ?? []
    if (current.length === target) return
    form.setValue('solution', Array.from({ length: target }, (_, index) => current[index] ?? ''), { shouldDirty: true })
  }, [blanks, form])

  const setBlocks = (next: string[]) => {
    form.setValue('blocks', next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted })
  }

  const [test, setTest] = useState<TestState>({ status: 'idle' })
  const [testDocument, setTestDocument] = useState('')
  // Remonta o iframe a cada teste: o mesmo srcDoc não recarregaria sozinho.
  const [runKey, setRunKey] = useState(0)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return
      if (!event.data || event.data.type !== PLAYGROUND_MESSAGE) return
      if (timer.current) clearTimeout(timer.current)
      setTest({ status: 'done', result: event.data.result ?? null, entries: event.data.entries ?? [] })
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const runTest = () => {
    if (timer.current) clearTimeout(timer.current)
    const values = form.getValues()
    setTestDocument(buildPlaygroundTestDocument(values, values.solution ?? []))
    setRunKey((key) => key + 1)
    setTest({ status: 'running' })
    timer.current = setTimeout(() => { setTest({ status: 'timeout' }) }, TEST_TIMEOUT_MS)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="playground-question">Instrução *</Label>
        <Textarea
          id="playground-question"
          rows={2}
          placeholder='ex.: Complete a regra para o título "Olá" ficar vermelho (red).'
          {...form.register('question')}
        />
        <p className="text-xs text-muted-foreground">
          Diga o que o código precisa fazer ao rodar, com os valores esperados.
        </p>
        {errors.question && <p className="text-xs text-destructive">{errors.question.message}</p>}
      </div>

      <HighlightField
        value={highlight}
        onChange={(next) => { form.setValue('highlight', next, { shouldDirty: true }) }}
        paragraphs={question ? [question] : []}
      />

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center gap-3">
          <Label htmlFor="playground-code" className="shrink-0">Código do aluno, com lacunas *</Label>
          <Select
            value={codeLanguage}
            onValueChange={(value) => {
              form.setValue('codeLanguage', value as CodePlaygroundContentForm['codeLanguage'], { shouldDirty: true })
            }}
          >
            <SelectTrigger className="w-40" aria-label="Linguagem do código do aluno"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLAYGROUND_LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Marque de 1 a 3 lacunas com <code>___</code>. No máximo 30 caracteres por linha com a solução encaixada.
        </p>
        <Textarea id="playground-code" rows={5} className="font-mono text-xs" {...form.register('code')} />
        <p className="text-xs text-muted-foreground">
          {blanks === 0 ? 'Nenhuma lacuna marcada.' : `${blanks} lacuna(s) encontrada(s).`}
        </p>
        {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Blocos</Label>
            <p className="text-xs text-muted-foreground">
              Tudo que o aluno pode tocar: as soluções e os distratores juntos. Qualquer combinação
              que passe no script de correção conta como certa.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => { setBlocks([...blocks, '']) }}>
            <Plus className="size-3.5" /> Bloco
          </Button>
        </div>
        {blocks.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Label htmlFor={`playground-block-${index}`} className="w-16 shrink-0 text-xs text-muted-foreground">Bloco {index + 1}</Label>
            <Input
              id={`playground-block-${index}`}
              className="font-mono"
              value={value}
              onChange={(event) => { setBlocks(blocks.map((current, k) => (k === index ? event.target.value : current))) }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive"
              title={`Remover o bloco ${index + 1}`}
              disabled={blocks.length <= 2}
              onClick={() => { setBlocks(blocks.filter((_, k) => k !== index)) }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        {errors.blocks && <p className="text-xs text-destructive">{errors.blocks.message ?? 'Confira os blocos.'}</p>}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div>
          <Label>Solução de referência</Label>
          <p className="text-xs text-muted-foreground">
            Um preenchimento que funciona, usado no Testar e na revisão. O app não corrige
            comparando com ele.
          </p>
        </div>
        {solution.map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Label htmlFor={`playground-solution-${index}`} className="w-16 shrink-0 text-xs text-muted-foreground">Lacuna {index + 1}</Label>
            <Input id={`playground-solution-${index}`} className="font-mono" {...form.register(`solution.${index}`)} />
          </div>
        ))}
        {errors.solution && (
          <p className="text-xs text-destructive">
            {errors.solution.message ?? (Array.isArray(errors.solution) ? errors.solution.find(Boolean)?.message : undefined) ?? 'Confira a solução.'}
          </p>
        )}
        <pre className="overflow-x-auto rounded bg-secondary p-2 font-mono text-xs">{fillBlanks(code, solution) || ' '}</pre>
      </div>

      <div className="space-y-3 rounded-md border border-border p-3">
        <div>
          <Label>Arquivos de apoio</Label>
          <p className="text-xs text-muted-foreground">
            Fixos, o aluno não edita. Ex.: o HTML em que o CSS do aluno se aplica.
          </p>
        </div>
        {SUPPORT_FIELDS.filter((field) => field.language !== codeLanguage).map((field) => (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={`playground-${field.key}`} className="text-sm">{field.label}</Label>
            <Textarea id={`playground-${field.key}`} rows={3} className="font-mono text-xs" {...form.register(field.key)} />
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <Label htmlFor="playground-check">Script de correção (checkScript) *</Label>
        <p className="text-xs text-muted-foreground">
          JavaScript que roda depois do código do aluno e chama <code>__codap_report(passou, mensagem)</code>.
          Pode ler o DOM, <code>getComputedStyle</code> e o console em <code>window.__codapConsoleEntries</code>.
        </p>
        <Textarea id="playground-check" rows={4} className="font-mono text-xs" {...form.register('checkScript')} />
        {errors.checkScript && <p className="text-xs text-destructive">{errors.checkScript.message}</p>}

        <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={runTest}>
          <Play className="size-3.5" /> Testar com a solução
        </Button>
        {test.status !== 'idle' && (
          <div data-testid="playground-test" className="space-y-2">
            <iframe
              key={runKey}
              ref={frameRef}
              title="Prévia do playground"
              sandbox="allow-scripts"
              srcDoc={testDocument}
              className="h-32 w-full rounded border border-border bg-white"
            />
            <p
              data-testid="playground-verdict"
              className={`text-sm font-medium ${test.status === 'done' && test.result?.passed ? 'text-green-500' : 'text-amber-500'}`}
            >
              {test.status === 'running' && 'Executando…'}
              {test.status === 'timeout' && 'Não respondeu em 4 s — o código pode ter um laço infinito.'}
              {test.status === 'done' && test.result === null && 'O script de correção não chamou __codap_report.'}
              {test.status === 'done' && test.result !== null && (test.result.passed
                ? 'Passou: a solução funciona.'
                : `Reprovou: ${test.result.message || 'sem mensagem'}`)}
            </p>
            {test.status === 'done' && test.entries.length > 0 && (
              <pre className="overflow-x-auto rounded bg-secondary p-2 font-mono text-xs">
                {test.entries.map((entry) => `${entry.type === 'error' ? 'Erro: ' : ''}${entry.message}`).join('\n')}
              </pre>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-md border border-border p-3">
        <div>
          <Label>Sorteio</Label>
          <p className="text-xs text-muted-foreground">
            Opcional, igual à múltipla escolha: exercícios com o mesmo pool são sorteados entre si.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <div className="space-y-2">
            <Label htmlFor="playground-pool" className="text-sm">Pool</Label>
            <Input id="playground-pool" placeholder="ex.: seletores" {...form.register('pool')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playground-draw" className="text-sm">Sortear</Label>
            <Input
              id="playground-draw"
              type="number"
              min={1}
              placeholder="1"
              {...form.register('draw', {
                setValueAs: (value: unknown) => (value === '' || value === undefined || value === null ? undefined : Number(value))
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Switch
          id="playground-tutorial"
          checked={form.watch('tutorial') ?? false}
          onCheckedChange={(checked) => { form.setValue('tutorial', checked, { shouldDirty: true }) }}
        />
        <div>
          <Label htmlFor="playground-tutorial" className="text-sm">Tutorial</Label>
          <p className="text-xs text-muted-foreground">Marca a tela como parte do tutorial inicial.</p>
        </div>
      </div>
    </div>
  )
}
