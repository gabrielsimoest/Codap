import { ClassContent } from "../../../../../../types/entities";

/**
 * Aulas de teste de `option` com `optionsAsCode` ("ache o erro") no modal
 * escondido (segurar "Sobre" por 5 s em Configurações). Servem para exercitar o
 * componente no emulador sem gravar nada no banco. Cada aula:
 * `{ title, classes: [{ type, lesson }] }`.
 *
 * A alternativa correta fica em posições variadas de propósito: este player não
 * passa pelo `buildLessonSession`, então nada embaralha.
 */
export const optionsAsCodeTestLessons: ClassContent = {
	pt: [
		{
			title: "Teste: ache o erro (HTML e CSS)",
			classes: [
				{
					// 3 alternativas de 2-3 linhas; o erro é a tag sem fechar.
					type: "option",
					lesson: {
						question: "Qual destes trechos tem um erro?",
						highlight: ["erro"],
						optionsAsCode: true,
						codeLanguage: "HTML",
						options: [
							"<p>Olá, mundo!</p>\n<p>Tudo bem?</p>",
							"<h1>Título</h2>\n<p>Texto</p>",
							"<ul>\n  <li>Item um</li>\n</ul>",
						],
						correctOption: 2,
					},
				},
				{
					// 4 alternativas, a certa na primeira; linha no limite de 30.
					type: "option",
					lesson: {
						question: "Qual trecho está escrito corretamente?",
						highlight: ["corretamente"],
						optionsAsCode: true,
						codeLanguage: "HTML",
						options: [
							'<img src="gato.png" alt="Cat">',
							'<img src="gato.png" alt=Cat',
							'<img "gato.png" alt="Cat">',
							'<img src=gato.png alt="Cat"',
						],
						correctOption: 1,
					},
				},
				{
					// CSS: `:` no lugar de `=`; a certa na quarta posição.
					type: "option",
					lesson: {
						question: "Qual regra de CSS está correta?",
						highlight: ["CSS"],
						optionsAsCode: true,
						codeLanguage: "CSS",
						options: [
							"p {\n  color = red;\n}",
							"p (\n  color: red;\n)",
							"p {\n  color: red,\n}",
							"p {\n  color: red;\n}",
						],
						correctOption: 4,
					},
				},
				{
					// Alternativas curtas (uma linha) e só 3 delas.
					type: "option",
					lesson: {
						question: "Qual seletor de CSS escolhe a classe destaque?",
						highlight: ["classe"],
						optionsAsCode: true,
						codeLanguage: "CSS",
						options: [".destaque { }", "#destaque { }", "destaque { }"],
						correctOption: 1,
					},
				},
			],
		},
		{
			title: "Teste: ache o erro (JavaScript)",
			classes: [
				{
					// `code` no enunciado junto das alternativas em código.
					type: "option",
					lesson: {
						question:
							"O código abaixo deveria somar dois números. Qual correção resolve?",
						highlight: ["somar"],
						code: "function soma(a, b) {\n  a + b;\n}\n\nsoma(2, 3);",
						codeLanguage: "JavaScript",
						optionsAsCode: true,
						options: [
							"function soma(a, b) {\n  return a + b;\n}",
							"function soma(a, b) {\n  a + b\n}",
							"function soma(a, b) {\n  return;\n}",
						],
						correctOption: 1,
					},
				},
				{
					// Qual tem o erro: o `=` de atribuição no lugar do `===`.
					type: "option",
					lesson: {
						question: "Qual destes trechos tem um erro?",
						highlight: ["erro"],
						optionsAsCode: true,
						codeLanguage: "JavaScript",
						options: [
							"if (idade >= 18) {\n  entrar();\n}",
							"if (nome === 'Ana') {\n  oi();\n}",
							"if (total == 10 {\n  fim();\n}",
							"while (n < 3) {\n  n++;\n}",
						],
						correctOption: 3,
					},
				},
				{
					// Linha no limite de 30 caracteres, em JS.
					type: "option",
					lesson: {
						question: "Qual linha mostra o texto no console?",
						highlight: ["console"],
						optionsAsCode: true,
						codeLanguage: "JavaScript",
						options: [
							'console.log("Olá, mundo!!!!");',
							'console.print("Olá, mundo!");',
							'log.console("Olá, mundo!");',
						],
						correctOption: 1,
					},
				},
			],
		},
	],
	en: [
		{
			title: "Test: find the bug (HTML and CSS)",
			classes: [
				{
					type: "option",
					lesson: {
						question: "Which of these snippets has an error?",
						highlight: ["error"],
						optionsAsCode: true,
						codeLanguage: "HTML",
						options: [
							"<p>Hello, world!</p>\n<p>How are you?</p>",
							"<h1>Title</h2>\n<p>Text</p>",
							"<ul>\n  <li>Item one</li>\n</ul>",
						],
						correctOption: 2,
					},
				},
				{
					type: "option",
					lesson: {
						question: "Which snippet is written correctly?",
						highlight: ["correctly"],
						optionsAsCode: true,
						codeLanguage: "HTML",
						options: [
							'<img src="gato.png" alt="Cat">',
							'<img src="gato.png" alt=Cat',
							'<img "gato.png" alt="Cat">',
							'<img src=gato.png alt="Cat"',
						],
						correctOption: 1,
					},
				},
				{
					type: "option",
					lesson: {
						question: "Which CSS rule is correct?",
						highlight: ["CSS"],
						optionsAsCode: true,
						codeLanguage: "CSS",
						options: [
							"p {\n  color = red;\n}",
							"p (\n  color: red;\n)",
							"p {\n  color: red,\n}",
							"p {\n  color: red;\n}",
						],
						correctOption: 4,
					},
				},
				{
					type: "option",
					lesson: {
						question: "Which CSS selector picks the highlight class?",
						highlight: ["class"],
						optionsAsCode: true,
						codeLanguage: "CSS",
						options: [".highlight { }", "#highlight { }", "highlight { }"],
						correctOption: 1,
					},
				},
			],
		},
		{
			title: "Test: find the bug (JavaScript)",
			classes: [
				{
					type: "option",
					lesson: {
						question:
							"The code below should add two numbers. Which fix works?",
						highlight: ["add"],
						code: "function sum(a, b) {\n  a + b;\n}\n\nsum(2, 3);",
						codeLanguage: "JavaScript",
						optionsAsCode: true,
						options: [
							"function sum(a, b) {\n  return a + b;\n}",
							"function sum(a, b) {\n  a + b\n}",
							"function sum(a, b) {\n  return;\n}",
						],
						correctOption: 1,
					},
				},
				{
					type: "option",
					lesson: {
						question: "Which of these snippets has an error?",
						highlight: ["error"],
						optionsAsCode: true,
						codeLanguage: "JavaScript",
						options: [
							"if (age >= 18) {\n  enter();\n}",
							"if (name === 'Ana') {\n  hi();\n}",
							"if (total == 10 {\n  end();\n}",
							"while (n < 3) {\n  n++;\n}",
						],
						correctOption: 3,
					},
				},
				{
					type: "option",
					lesson: {
						question: "Which line shows the text in the console?",
						highlight: ["console"],
						optionsAsCode: true,
						codeLanguage: "JavaScript",
						options: [
							'console.log("Hello, world!!");',
							'console.print("Hello, world!");',
							'log.console("Hello, world!");',
						],
						correctOption: 1,
					},
				},
			],
		},
	],
};
