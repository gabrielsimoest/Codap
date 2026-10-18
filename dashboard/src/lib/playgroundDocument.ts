import type { CodePlaygroundContentForm } from './activitySchemas'

/**
 * Documento de teste do `code_playground` para o botão "Testar" do formulário.
 *
 * **Espelho** de `buildSandboxHtmlDocument` (`app/src/utils/codeSandboxDocument.ts`)
 * com `checkScript`, `consolePanel: false`, `blockNetwork: true`, `loopGuardMs`
 * e `forwardConsole: false`: o app e o
 * dashboard não compartilham código em tempo de execução (só tipos, via
 * `contracts.ts`), então quem mudar o shim, o `__codap_report` ou a CSP de um
 * lado muda o outro. A diferença única é o destino da mensagem: aqui o
 * resultado vai para a página pai (`parent.postMessage`), porque o documento
 * roda num `<iframe sandbox>`, não numa WebView.
 */
export const PLAYGROUND_MESSAGE = 'codapPlaygroundTest'

const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:"

/** Mesmos limites do app (ver `loopGuardMs`/`MAX_CONSOLE_ENTRIES` no codeSandboxDocument). */
const LOOP_GUARD_MS = 1000
const MAX_CONSOLE_ENTRIES = 500

const SHIM = `
  window.__codapConsoleEntries = [];
  window.__codapResult = null;
  window.__codapLoopDeadline = 0;
  window.__codapLoopGuard = function () {
    if (window.__codapLoopDeadline && Date.now() > window.__codapLoopDeadline) {
      throw new Error("O laço foi interrompido: ele não terminava.");
    }
  };
  window.__codap_report = function (passed, message) {
    window.__codapResult = { passed: passed === true, message: message == null ? "" : String(message) };
  };
  function __codapFormatArgs(args) {
    return Array.prototype.map.call(args, function (arg) {
      return typeof arg === "string" ? arg : JSON.stringify(arg);
    }).join(" ");
  }
  ["log", "info", "warn", "error"].forEach(function (name) {
    console[name] = function () {
      if (window.__codapConsoleEntries.length >= ${MAX_CONSOLE_ENTRIES}) return;
      window.__codapConsoleEntries.push({ type: name === "info" ? "log" : name, message: __codapFormatArgs(arguments) });
    };
  });
  window.onerror = function (message) {
    if (window.__codapConsoleEntries.length < ${MAX_CONSOLE_ENTRIES} + 20) {
      window.__codapConsoleEntries.push({ type: "error", message: String(message) });
    }
    return true;
  };
`

/**
 * Espelho de `protectLoops` do app: insere `__codapLoopGuard();` no início de
 * cada `for`/`while`/`do`. Aqui ele é ainda mais necessário — um laço infinito
 * no iframe congelaria a aba inteira do dashboard, que roda no mesmo processo.
 */
export function protectLoops (code: string): string {
  let out = ""
  let i = 0
  const n = code.length
  const isIdent = (c: string | undefined) => c !== undefined && /[A-Za-z0-9_$]/.test(c)
  const skipSpace = (from: number) => {
    let k = from
    while (k < n && /\s/.test(code[k])) k++
    return k
  }
  while (i < n) {
    const c = code[i]
    // Comentários e strings passam intactos.
    if (c === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i)
      const stop = end === -1 ? n : end
      out += code.slice(i, stop)
      i = stop
      continue
    }
    if (c === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2)
      const stop = end === -1 ? n : end + 2
      out += code.slice(i, stop)
      i = stop
      continue
    }
    if (c === '"' || c === "'" || c === "`") {
      let k = i + 1
      while (k < n && code[k] !== c) k += code[k] === "\\" ? 2 : 1
      out += code.slice(i, k + 1)
      i = k + 1
      continue
    }
    const word = /^(for|while|do)\b/.exec(code.slice(i, i + 6))
    if (word && !isIdent(code[i - 1])) {
      const keyword = word[1]
      let k = skipSpace(i + keyword.length)
      if (keyword !== "do") {
        if (code[k] !== "(") {
          out += c
          i++
          continue
        }
        let depth = 0
        for (; k < n; k++) {
          if (code[k] === "(") depth++
          else if (code[k] === ")") {
            depth--
            if (depth === 0) break
          }
        }
        k = skipSpace(k + 1)
      }
      if (code[k] === "{") {
        out += code.slice(i, k + 1) + " __codapLoopGuard();"
        i = k + 1
        continue
      }
    }
    out += c
    i++
  }
  return out
}

/** Encaixa os blocos nas lacunas, na ordem. */
export function fillBlanks (code: string, values: string[]): string {
  return values.reduce((acc, value) => acc.replace('___', value), code)
}

export function buildPlaygroundTestDocument (content: Pick<CodePlaygroundContentForm, 'codeLanguage' | 'code' | 'html' | 'css' | 'js' | 'checkScript'>, values: string[]): string {
  const filled = fillBlanks(content.code, values)
  const html = content.codeLanguage === 'HTML' ? filled : (content.html ?? '')
  const css = content.codeLanguage === 'CSS' ? filled : (content.css ?? '')
  const rawJs = content.codeLanguage === 'JavaScript' ? filled : (content.js ?? '')
  const js = rawJs ? `window.__codapLoopDeadline = Date.now() + ${LOOP_GUARD_MS};\n${protectLoops(rawJs)}` : ''
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>${css}</style>
<script>${SHIM}</script>
</head>
<body>
${html}
${js ? `<script>${js}</script>` : ''}
<script>
try {
${content.checkScript}
} catch (__codapCheckError) {
  window.__codap_report(false, String(__codapCheckError && __codapCheckError.message || __codapCheckError));
}
</script>
<script>
parent.postMessage({ type: ${JSON.stringify(PLAYGROUND_MESSAGE)}, entries: window.__codapConsoleEntries, result: window.__codapResult }, "*");
</script>
</body>
</html>`
}
