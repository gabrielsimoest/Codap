import { Toaster as Sonner } from 'sonner'

/**
 * Wrapper próprio em vez do `sonner.tsx` do shadcn: aquele lê o tema via
 * `next-themes`, uma dependência inteira para uma informação que aqui é fixa
 * (o dashboard é escuro, `index.html` fixa `class="dark"` no <html>).
 *
 * Quando houver alternador de tema, é este arquivo que passa a ler o tema —
 * não o componente gerado em `components/ui/`.
 */
export function Toaster () {
  return (
    <Sonner
      theme="dark"
      // Topo ao centro: o rodapé direito passou a ser da bolha do React Query, e
      // o cabeçalho tem o seletor à esquerda e os botões à direita — o meio fica
      // livre.
      position="top-center"
      className="print-hidden"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)'
      } as React.CSSProperties}
    />
  )
}
