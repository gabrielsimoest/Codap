import type { CodePlaygroundContentForm } from './activitySchemas'

/**
 * Documento de teste do `code_playground` e do `code_editor`, para o botão
 * "Testar" dos formulários.
 *
 * **Espelho** de `buildSandboxHtmlDocument` (`app/src/utils/codeSandboxDocument.ts`)
 * com `checkScript`, `consolePanel: false`, `blockNetwork: true`, `loopGuardMs`
 * e `forwardConsole: false`: o app e o dashboard não compartilham código em
 * tempo de execução (só tipos, via `contracts.ts`), então quem mudar o shim, o
 * `__codap_report`/`__codap_check`, a CSP, a proteção de laços ou o escape de
 * `</script>` de um lado muda o outro. A diferença única é o destino da
 * mensagem: aqui o resultado vai para a página pai (`parent.postMessage`),
 * porque o documento roda num `<iframe sandbox>`, não numa WebView.
 */
export const PLAYGROUND_MESSAGE = 'codapPlaygroundTest'

const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:"

/** Mesmos limites do app (ver `loopGuardMs`/`MAX_CONSOLE_ENTRIES` no codeSandboxDocument). */
const LOOP_GUARD_MS = 1000
const MAX_CONSOLE_ENTRIES = 500

/** Um requisito do `__codap_check`. */
export interface SandboxCheck {
  label: string
  passed: boolean
}

export interface SandboxResult {
  passed: boolean
  message: string
  checks: SandboxCheck[]
}

const SHIM = `
  (function () {
    var result = null;
    var checks = [];
    var now = Date.now;
    var later = window.setTimeout;
    var taskStart = 0;
    function lock(name, value) {
      Object.defineProperty(window, name, { value: value, writable: false, configurable: false });
    }
    lock("__codapConsoleEntries", []);
    lock("__codap_report", function (passed, message) {
      result = { passed: passed === true, message: message == null ? "" : String(message) };
    });
    lock("__codap_check", function (label, passed) {
      checks.push({ label: String(label), passed: passed === true });
      return passed === true;
    });
    lock("__codapResetResult", function () {
      result = null;
      checks = [];
    });
    lock("__codapFinishChecks", function () {
      if (result === null && checks.length > 0) {
        result = { passed: checks.every(function (check) { return check.passed; }), message: "" };
      }
    });
    Object.defineProperty(window, "__codapResult", {
      get: function () {
        return result === null ? null : { passed: result.passed, message: result.message, checks: checks.slice() };
      },
      set: function () {},
      configurable: false
    });
    lock("__codapLoopGuard", function () {
      var t = now();
      if (!taskStart) {
        taskStart = t;
        later(function () { taskStart = 0; }, 0);
      } else if (t - taskStart > ${LOOP_GUARD_MS}) {
        throw new Error("O laço foi interrompido: ele não terminava.");
      }
      return true;
    });
  })();
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
  window.addEventListener("unhandledrejection", function (event) {
    if (window.__codapConsoleEntries.length < ${MAX_CONSOLE_ENTRIES} + 20) {
      window.__codapConsoleEntries.push({ type: "error", message: "Uncaught (in promise) " + String(event.reason) });
    }
    event.preventDefault();
  });
`

function skipQuoted (code: string, start: number): number {
  const quote = code[start]
  let k = start + 1
  while (k < code.length && code[k] !== quote) k += code[k] === '\\' ? 2 : 1
  return k + 1
}

function matchParen (code: string, open: number): number {
  let depth = 0
  for (let k = open; k < code.length; k++) {
    const c = code[k]
    if (c === '"' || c === "'" || c === '`') {
      k = skipQuoted(code, k) - 1
    } else if (c === '(') {
      depth++
    } else if (c === ')') {
      depth--
      if (depth === 0) return k
    }
  }
  return -1
}

function topLevelSemicolons (code: string): number[] {
  const found: number[] = []
  let depth = 0
  for (let k = 0; k < code.length; k++) {
    const c = code[k]
    if (c === '"' || c === "'" || c === '`') k = skipQuoted(code, k) - 1
    else if (c === '(' || c === '[' || c === '{') depth++
    else if (c === ')' || c === ']' || c === '}') depth--
    else if (c === ';' && depth === 0) found.push(k)
  }
  return found
}

/**
 * Espelho de `protectLoops` do app: a checagem vai na condição de cada
 * `for`/`while` (cobre laços sem chaves e o `while` do fim de um `do`), e no
 * corpo de `for…in`/`for…of`. Aqui ela é ainda mais necessária — um laço
 * infinito no iframe congelaria a aba inteira do dashboard, que roda no mesmo
 * processo.
 */
export function protectLoops (code: string): string {
  let out = ''
  let i = 0
  const n = code.length
  const isIdent = (c: string | undefined) => c !== undefined && /[A-Za-z0-9_$.]/.test(c)
  const skipSpace = (from: number) => {
    let k = from
    while (k < n && /\s/.test(code[k])) k++
    return k
  }
  while (i < n) {
    const c = code[i]
    // Comentários e strings passam intactos.
    if (c === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i)
      const stop = end === -1 ? n : end
      out += code.slice(i, stop)
      i = stop
      continue
    }
    if (c === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      const stop = end === -1 ? n : end + 2
      out += code.slice(i, stop)
      i = stop
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      const stop = skipQuoted(code, i)
      out += code.slice(i, stop)
      i = stop
      continue
    }
    const word = /^(for|while)\b/.exec(code.slice(i, i + 6))
    if (word && !isIdent(code[i - 1])) {
      const keyword = word[1]
      const open = skipSpace(i + keyword.length)
      const close = code[open] === '(' ? matchParen(code, open) : -1
      if (close !== -1) {
        const head = code.slice(i, open + 1)
        const inner = code.slice(open + 1, close)
        if (keyword === 'while') {
          out += `${head}__codapLoopGuard() && (${protectLoops(inner)}))`
          i = close + 1
          continue
        }
        const semicolons = topLevelSemicolons(inner)
        if (semicolons.length === 2) {
          const [a, b] = semicolons
          const condition = inner.slice(a + 1, b)
          const guarded = condition.trim()
            ? `__codapLoopGuard() && (${protectLoops(condition)})`
            : ' __codapLoopGuard()'
          out += `${head}${protectLoops(inner.slice(0, a))};${guarded};${protectLoops(inner.slice(b + 1))})`
          i = close + 1
          continue
        }
        const body = skipSpace(close + 1)
        if (code[body] === '{') {
          out += code.slice(i, body + 1) + ' __codapLoopGuard();'
          i = body + 1
          continue
        }
      }
    }
    out += c
    i++
  }
  return out
}

function protectInlineScripts (html: string): string {
  return html.replace(
    /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi,
    (_, open: string, body: string, close: string) => open + protectLoops(body) + close
  )
}

function escapeScript (code: string): string {
  return code.replace(/<\/(script)/gi, '<\\/$1')
}

function escapeStyle (code: string): string {
  return code.replace(/<\/(style)/gi, '<\\/$1')
}

/** Encaixa os blocos nas lacunas, na ordem. */
export function fillBlanks (code: string, values: string[]): string {
  return values.reduce((acc, value) => acc.replace('___', value), code)
}

export interface SandboxSources {
  html?: string
  css?: string
  js?: string
  checkScript: string
}

/**
 * Documento completo, já com o código do aluno no lugar da linguagem dele. A
 * correção e o envio do resultado ficam no `<head>` e rodam no
 * `DOMContentLoaded`, como no app: um HTML do aluno que termina no meio de uma
 * tag não os engole.
 */
export function buildSandboxTestDocument ({ html = '', css = '', js = '', checkScript }: SandboxSources): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<style>${escapeStyle(css)}</style>
<script>${SHIM}</script>
<script>
document.addEventListener("DOMContentLoaded", function () {
  window.__codapResetResult();
  try {
${escapeScript(checkScript)}
  } catch (__codapCheckError) {
    window.__codap_report(false, String(__codapCheckError && __codapCheckError.message || __codapCheckError));
  }
  window.__codapFinishChecks();
});
</script>
<script>
document.addEventListener("DOMContentLoaded", function () {
  parent.postMessage({ type: ${JSON.stringify(PLAYGROUND_MESSAGE)}, entries: window.__codapConsoleEntries, result: window.__codapResult }, "*");
});
</script>
</head>
<body>
${protectInlineScripts(html)}
${js ? `<script>${escapeScript(protectLoops(js))}</script>` : ''}
</body>
</html>`
}

export function buildPlaygroundTestDocument (content: Pick<CodePlaygroundContentForm, 'codeLanguage' | 'code' | 'html' | 'css' | 'js' | 'checkScript'>, values: string[]): string {
  const filled = fillBlanks(content.code, values)
  return buildSandboxTestDocument({
    html: content.codeLanguage === 'HTML' ? filled : content.html,
    css: content.codeLanguage === 'CSS' ? filled : content.css,
    js: content.codeLanguage === 'JavaScript' ? filled : content.js,
    checkScript: content.checkScript
  })
}
