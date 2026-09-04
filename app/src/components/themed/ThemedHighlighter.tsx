import React from "react";
import HighlightText from "@sanar/react-native-highlight-text";
import { StyleProp, TextStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props {
	text: string;
	highlight: string[];
	style?: StyleProp<TextStyle>;
}

/**
 * Caracteres que contam como "letra" ao decidir onde um destaque começa e
 * termina.
 *
 * Existe porque `\b` do JavaScript é **ASCII-only** (`\w` é `[A-Za-z0-9_]`):
 * uma letra acentuada não conta como letra e *cria* uma fronteira onde não
 * deveria haver nenhuma. Na prática, `\bp\b` casava o "p" de "página" e o aluno
 * via meia palavra pintada no meio do parágrafo.
 *
 * A faixa `À-ÿ` (menos os dois sinais de multiplicação/divisão) cobre todos os
 * acentos do português. **Não dá para usar `\p{L}` aqui**: o
 * `highlight-words-core`, sob o `@sanar/react-native-highlight-text`, monta a
 * `RegExp` sem a flag `u`, e sem ela `\p{...}` não é interpretado.
 */
const LETTER = "A-Za-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u00FF0-9_";

/** Um termo escrito como `<a>` ou `</a>` — ver `patternFor`. */
const TAG_TERM = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)>$/;

/**
 * Traduz um termo de `highlight` no padrão de busca correspondente.
 *
 * Há duas formas:
 *
 * - **`<tag>`** — destaca o *nome* da tag, e só dentro dos colchetes: casa em
 *   `<a>` e `</a>`, pintando apenas o `a`. É o que permite destacar a tag `<a>`
 *   sem destacar o artigo "a" de "o que **a** pessoa vê", coisa impossível com
 *   o termo `a` solto.
 * - **qualquer outro termo** — palavra inteira, em qualquer lugar do texto.
 *
 * Os dois lookbehind separados (`<` e `</`) evitam depender de lookbehind de
 * tamanho variável, que é suportado por menos motores.
 */
function patternFor(term: string): string {
	const tag = term.match(TAG_TERM);
	if (tag) {
		const name = tag[1];
		return `(?<=<)${name}(?=>)|(?<=</)${name}(?=>)`;
	}

	// `<` e `>` não são letras, então tags também casam por esta regra — assim
	// como termos que começam com símbolo (`:hover`, `--cor`), que com `\b`
	// nunca destacavam nada.
	return `(?<![${LETTER}])${term}(?![${LETTER}])`;
}

function ThemedHighlighter({ style = {}, highlight, text }: Props) {
	const { colors } = useTheme();

	return (
		<HighlightText
			style={[style, { color: colors.text }]}
			highlightStyle={{ color: "#637aff" }}
			searchWords={highlight.map(patternFor)}
			textToHighlight={text}
		/>
	);
}

export default ThemedHighlighter;
