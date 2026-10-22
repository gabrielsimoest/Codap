import { atomOneLight, dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

/**
 * Tema de código da tela de teoria: o Dracula do highlight.js (o mesmo
 * `react-syntax-highlighter` já usado no app) adaptado à paleta nova. As
 * mudanças em relação ao Dracula puro: fundo #0E121B, nome de tag em rosa (o
 * Dracula usa amarelo, que se confunde com as strings), doctype em ciano e
 * atributos em verde. O restante — palavras-chave, números, comentários —
 * continua com a leitura do Dracula.
 *
 * O `padding` do bloco fica zerado: quem posiciona o código é o editor, que
 * também precisa do conteúdo sem folga para alinhar os números de linha.
 */
type HljsStyle = Record<string, Record<string, string | number>>;

const base = dracula as unknown as HljsStyle;

export const codapDark: HljsStyle = {
	...base,
	hljs: { ...base.hljs, background: "#0E121B", color: "#E6ECF8", padding: 0 },
	"hljs-meta": { color: "#33B5F2" },
	"hljs-meta-keyword": { color: "#33B5F2" },
	"hljs-name": { color: "#E5486F" },
	"hljs-tag": { color: "#8A93A8" },
	"hljs-attr": { color: "#50FA7B" },
	"hljs-attribute": { color: "#8BE9FD" },
	"hljs-keyword": { color: "#FF79C6" },
	"hljs-selector-tag": { color: "#E5486F" },
	"hljs-selector-class": { color: "#50FA7B" },
	"hljs-selector-id": { color: "#50FA7B" },
	"hljs-built_in": { color: "#8BE9FD" },
	"hljs-number": { color: "#BD93F9" },
	"hljs-string": { color: "#F1FA8C" },
	"hljs-title": { color: "#50FA7B" },
	"hljs-comment": { color: "#6272A4" },
};

const light = atomOneLight as unknown as HljsStyle;

/** Versão clara: atomOneLight com o fundo branco do editor claro e sem padding. */
export const codapLight: HljsStyle = {
	...light,
	hljs: { ...light.hljs, background: "#FFFFFF", padding: 0 },
};
