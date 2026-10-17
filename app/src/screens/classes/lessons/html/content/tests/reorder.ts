import { ClassContent } from "../../../../../../types/entities";

/**
 * Aulas de teste de `reorder` no modal escondido (segurar "Sobre" por 5 s em
 * Configurações). Servem para exercitar o componente no emulador sem gravar
 * nada no banco. Cada aula: `{ title, classes: [{ type, lesson }] }`.
 *
 * Cobertura: HTML aninhado com indentação em vários níveis, CSS, JS com duas
 * linhas iguais (os dois `}` podem trocar de lugar), sem distratores e com 1 e 2
 * distratores. Linhas de até 30 caracteres, e cada trecho tem uma única ordem
 * válida (o enunciado fixa a ordem quando as linhas poderiam trocar).
 */
export const reorderTestLessons: ClassContent = {
	pt: [
		{
			title: "Teste: montar código (HTML e CSS)",
			classes: [
				{
					type: "reorder",
					lesson: {
						question: "Monte o menu: uma lista com um item que tem um link.",
						highlight: ["lista", "link"],
						codeLanguage: "HTML",
						lines: [
							"<ul>",
							"  <li>",
							"    <a>Início</a>",
							"  </li>",
							"</ul>",
						],
					},
				},
				{
					type: "reorder",
					lesson: {
						question: "Monte a página: primeiro o título, depois o parágrafo.",
						highlight: ["título", "parágrafo"],
						codeLanguage: "HTML",
						lines: [
							"<body>",
							"  <h1>Olá</h1>",
							"  <p>Bem-vindo</p>",
							"</body>",
						],
						distractors: ["<head>", "</h1>"],
					},
				},
				{
					type: "reorder",
					lesson: {
						question: "Monte a regra que pinta o título de azul.",
						highlight: ["azul"],
						codeLanguage: "CSS",
						lines: ["h1 {", "  color: blue;", "}"],
						distractors: ["color: blue"],
					},
				},
			],
		},
		{
			title: "Teste: montar código (JavaScript)",
			classes: [
				{
					type: "reorder",
					lesson: {
						question:
							"Monte os dois testes: primeiro o da chuva, depois o do sol.",
						highlight: ["chuva", "sol"],
						codeLanguage: "JavaScript",
						lines: [
							"if (chuva) {",
							"  guardaChuva();",
							"}",
							"if (sol) {",
							"  oculos();",
							"}",
						],
					},
				},
				{
					type: "reorder",
					lesson: {
						question: "Monte a função que soma dois números e devolve o resultado.",
						highlight: ["função", "soma"],
						codeLanguage: "JavaScript",
						lines: [
							"function soma(a, b) {",
							"  const r = a + b;",
							"  return r;",
							"}",
						],
						distractors: ["function soma(a, b)", "return r"],
					},
				},
			],
		},
	],
	en: [
		{
			title: "Test: build the code (HTML and CSS)",
			classes: [
				{
					type: "reorder",
					lesson: {
						question: "Build the menu: a list with one item that has a link.",
						highlight: ["list", "link"],
						codeLanguage: "HTML",
						lines: [
							"<ul>",
							"  <li>",
							"    <a>Home</a>",
							"  </li>",
							"</ul>",
						],
					},
				},
				{
					type: "reorder",
					lesson: {
						question: "Build the page: the heading first, then the paragraph.",
						highlight: ["heading", "paragraph"],
						codeLanguage: "HTML",
						lines: [
							"<body>",
							"  <h1>Hello</h1>",
							"  <p>Welcome</p>",
							"</body>",
						],
						distractors: ["<head>", "</h1>"],
					},
				},
				{
					type: "reorder",
					lesson: {
						question: "Build the rule that paints the heading blue.",
						highlight: ["blue"],
						codeLanguage: "CSS",
						lines: ["h1 {", "  color: blue;", "}"],
						distractors: ["color: blue"],
					},
				},
			],
		},
		{
			title: "Test: build the code (JavaScript)",
			classes: [
				{
					type: "reorder",
					lesson: {
						question: "Build the two checks: the rain one first, then the sun one.",
						highlight: ["rain", "sun"],
						codeLanguage: "JavaScript",
						lines: [
							"if (rain) {",
							"  umbrella();",
							"}",
							"if (sun) {",
							"  glasses();",
							"}",
						],
					},
				},
				{
					type: "reorder",
					lesson: {
						question: "Build the function that adds two numbers and returns the result.",
						highlight: ["function", "adds"],
						codeLanguage: "JavaScript",
						lines: [
							"function sum(a, b) {",
							"  const r = a + b;",
							"  return r;",
							"}",
						],
						distractors: ["function sum(a, b)", "return r"],
					},
				},
			],
		},
	],
};
