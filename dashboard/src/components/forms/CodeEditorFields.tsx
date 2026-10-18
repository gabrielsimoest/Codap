import { useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch, type Control } from 'react-hook-form'
import { Check, Play, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { HighlightField } from './HighlightField'
import { PLAYGROUND_LANGUAGES, type CodeEditorContentForm } from '@/lib/activitySchemas'
import { PLAYGROUND_MESSAGE, buildSandboxTestDocument, type SandboxResult } from '@/lib/playgroundDocument'

/** Mesmo prazo do app: sem resposta nesse tempo, a execução é dada como travada. */
const TEST_TIMEOUT_MS = 4000
const MAX_HINTS = 3

type TestSubject = 'solution' | 'starter'

type TestState =
  | { status: 'idle' }
  | { status: 'running', subject: TestSubject }
  | { status: 'timeout', subject: TestSubject }
  | { status: 'done', subject: TestSubject, result: SandboxResult | null, entries: { type: string, message: string }[] }

const SUPPORT_FIELDS = [
  { key: 'html', language: 'HTML', label: 'HTML de apoio' },
  { key: 'css', language: 'CSS', label: 'CSS de apoio' },
  { key: 'js', language: 'JavaScript', label: 'JavaScript de apoio' }
] as const

/** O que cada teste deveria dar: a solução passa, o código inicial não. */
function verdictText (state: TestState): string {
  if (state.status === 'idle') return ''
  if (state.status === 'running') return 'Executando…'
  if (state.status === 'timeout') return 'Não respondeu em 4 s — o código pode ter um laço infinito.'
  const subject = state.subject === 'solution' ? 'A solução' : 'O código inicial'
  if (state.result === null) return 'O script de correção não chamou __codap_check nem __codap_report.'
  if (state.subject === 'solution') {
    return state.result.passed ? 'Passou: a solução funciona.' : `Reprovou: a solução não passa. ${state.result.message}`.trim()
  }
  return state.result.passed
    ? `${subject} já passa — o desafio começaria resolvido.`
    : `${subject} não passa, como esperado.`
}

function verdictOk (state: TestState): boolean {
  if (state.status !== 'done' || state.result === null) return false
  return state.subject === 'solution' ? state.result.passed : !state.result.passed
}

/**
 * Formulário de uma atividade `code_editor` (desafio final de módulo),
 * espelhando `CodeEditorActivityContent`.
 *
 * Os dois testes rodam o desafio no mesmo `<iframe sandbox="allow-scripts">`
 * do playground (`buildSandboxTestDocument`, espelho do sandbox do app): com a
 * solução, que precisa passar, e com o código inicial, que **não** pode passar
 * — senão o aluno abriria o desafio já resolvido. A lista de requisitos
 * marcada pelo `__codap_check` aparece como o aluno vai vê-la.
 */
export function CodeEditorFields () {
  const form = useFormContext<CodeEditorContentForm>()
  const control = form.control as Control<CodeEditorContentForm>

  const question = useWatch({ control, name: 'question' })
  const highlight = useWatch({ control, name: 'highlight' }) ?? []
  const codeLanguage = useWatch({ control, name: 'codeLanguage' }) ?? 'HTML'
  const hints = useWatch({ control, name: 'hints' }) ?? []
  const errors = form.formState.errors

  const setHints = (next: string[]) => {
    form.setValue('hints', next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted })
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
      setTest((current) => current.status === 'running'
        ? { status: 'done', subject: current.subject, result: event.data.result ?? null, entries: event.data.entries ?? [] }
        : current)
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const runTest = (subject: TestSubject) => {
    if (timer.current) clearTimeout(timer.current)
    const values = form.getValues()
    const code = subject === 'solution' ? values.solution : values.starterCode
    setTestDocument(buildSandboxTestDocument({
      html: values.codeLanguage === 'HTML' ? code : values.html,
      css: values.codeLanguage === 'CSS' ? code : values.css,
      js: values.codeLanguage === 'JavaScript' ? code : values.js,
      checkScript: values.checkScript
    }))
    setRunKey((key) => key + 1)
    setTest({ status: 'running', subject })
    timer.current = setTimeout(() => { setTest({ status: 'timeout', subject }) }, TEST_TIMEOUT_MS)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="editor-question">Desafio *</Label>
        <Textarea
          id="editor-question"
          rows={3}
          placeholder='ex.: Crie um título "Receitas" e uma lista numerada com "Arroz" e "Feijão".'
          {...form.register('question')}
        />
        <p className="text-xs text-muted-foreground">
          Diga o que o código precisa fazer ao rodar, com os valores exatos — cada requisito do
          script de correção precisa estar no enunciado.
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
          <Label htmlFor="editor-starter" className="shrink-0">Código inicial</Label>
          <Select
            value={codeLanguage}
            onValueChange={(value) => {
              form.setValue('codeLanguage', value as CodeEditorContentForm['codeLanguage'], { shouldDirty: true })
            }}
          >
            <SelectTrigger className="w-40" aria-label="Linguagem que o aluno escreve"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLAYGROUND_LANGUAGES.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Com o que o editor do aluno começa (pode ficar vazio). Traga pronto o que não está sendo
          avaliado: digitar no celular é lento. No máximo 30 caracteres por linha.
        </p>
        <Textarea id="editor-starter" rows={4} className="font-mono text-xs" {...form.register('starterCode')} />
        {errors.starterCode && <p className="text-xs text-destructive">{errors.starterCode.message}</p>}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <Label htmlFor="editor-solution">Solução *</Label>
        <p className="text-xs text-muted-foreground">
          Código completo que passa. O aluno a vê só depois das dicas, quando empaca; o Testar usa ela.
          Mire em 10 a 15 linhas, de no máximo 30 caracteres.
        </p>
        <Textarea id="editor-solution" rows={6} className="font-mono text-xs" {...form.register('solution')} />
        {errors.solution && <p className="text-xs text-destructive">{errors.solution.message}</p>}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Dicas</Label>
            <p className="text-xs text-muted-foreground">
              De 1 a 3, da mais leve à mais direta. Liberadas uma por vez, a cada 2 execuções sem
              passar ou a cada 90 s; a solução vem depois da última.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={hints.length >= MAX_HINTS}
            onClick={() => { setHints([...hints, '']) }}
          >
            <Plus className="size-3.5" /> Dica
          </Button>
        </div>
        {hints.map((value, index) => (
          <div key={index} className="flex items-start gap-2">
            <Label htmlFor={`editor-hint-${index}`} className="w-14 shrink-0 pt-2 text-xs text-muted-foreground">Dica {index + 1}</Label>
            <Textarea
              id={`editor-hint-${index}`}
              rows={2}
              value={value}
              onChange={(event) => { setHints(hints.map((current, k) => (k === index ? event.target.value : current))) }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive"
              title={`Remover a dica ${index + 1}`}
              disabled={hints.length <= 1}
              onClick={() => { setHints(hints.filter((_, k) => k !== index)) }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        {errors.hints && (
          <p className="text-xs text-destructive">
            {errors.hints.message ?? (Array.isArray(errors.hints) ? errors.hints.find(Boolean)?.message : undefined) ?? 'Confira as dicas.'}
          </p>
        )}
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
            <Label htmlFor={`editor-${field.key}`} className="text-sm">{field.label}</Label>
            <Textarea id={`editor-${field.key}`} rows={3} className="font-mono text-xs" {...form.register(field.key)} />
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-md border border-border p-3">
        <Label htmlFor="editor-check">Script de correção (checkScript) *</Label>
        <p className="text-xs text-muted-foreground">
          Roda depois do código do aluno. Chame <code>__codap_check("rótulo", passou)</code> uma vez por
          requisito: o aluno vê a lista marcada e passa quando todos passam. O código é livre, então
          confira a existência de cada elemento antes de usá-lo; com JavaScript, prefira chamar as
          funções do aluno com outros valores a ler só o console.
        </p>
        <Textarea id="editor-check" rows={6} className="font-mono text-xs" {...form.register('checkScript')} />
        {errors.checkScript && <p className="text-xs text-destructive">{errors.checkScript.message}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={() => { runTest('solution') }}>
            <Play className="size-3.5" /> Testar com a solução
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => { runTest('starter') }}>
            <Play className="size-3.5" /> Testar o código inicial
          </Button>
        </div>
        {test.status !== 'idle' && (
          <div data-testid="editor-test" className="space-y-2">
            <iframe
              key={runKey}
              ref={frameRef}
              title="Prévia do desafio"
              sandbox="allow-scripts"
              srcDoc={testDocument}
              className="h-40 w-full rounded border border-border bg-white"
            />
            <p
              data-testid="editor-verdict"
              className={`text-sm font-medium ${verdictOk(test) ? 'text-green-500' : 'text-amber-500'}`}
            >
              {verdictText(test)}
            </p>
            {test.status === 'done' && test.result !== null && test.result.checks.length > 0 && (
              <ul data-testid="editor-checks" className="space-y-1 text-sm">
                {test.result.checks.map((check, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {check.passed
                      ? <Check className="size-4 text-green-500" aria-label="passou" />
                      : <X className="size-4 text-destructive" aria-label="não passou" />}
                    {check.label}
                  </li>
                ))}
              </ul>
            )}
            {test.status === 'done' && test.entries.length > 0 && (
              <pre className="overflow-x-auto rounded bg-secondary p-2 font-mono text-xs">
                {test.entries.map((entry) => `${entry.type === 'error' ? 'Erro: ' : ''}${entry.message}`).join('\n')}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
