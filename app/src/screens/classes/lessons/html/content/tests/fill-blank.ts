import { ClassContent } from "../../../../../../types/entities";

/**
 * Aulas de teste de `fill_blank` no modal escondido (segurar "Sobre" por 5 s em
 * Configurações). Cobrem `ignoreCase` (HTML e CSS), maiúsculas que contam
 * (JavaScript e TypeScript) e mais de uma resposta aceita.
 */
export const fillBlankTestLessons: ClassContent = {
	pt: [
		{
			title: "Teste: digitar a resposta (HTML e CSS)",
			classes: [
				{
					type: "fill_blank",
					lesson: {
						question:
							'Digite o nome da tag de parágrafo que abre o texto "Olá".',
						highlight: ["parágrafo"],
						codeLanguage: "HTML",
						code: "<___>Olá</p>",
						answers: ["p"],
						ignoreCase: true,
					},
				},
				{
					type: "fill_blank",
					lesson: {
						question:
							"Digite a propriedade que pinta de vermelho (red) o texto do .card.",
						highlight: ["propriedade"],
						codeLanguage: "CSS",
						code: ".card {\n  ___: red;\n}",
						answers: ["color"],
						ignoreCase: true,
					},
				},
			],
		},
		{
			title: "Teste: digitar a resposta (JavaScript e TypeScript)",
			classes: [
				{
					type: "fill_blank",
					lesson: {
						question:
							"Digite o método que adiciona o 3 no fim do array nums.",
						highlight: ["método"],
						codeLanguage: "JavaScript",
						code: "const nums = [1, 2];\nnums.___(3);\nconsole.log(nums);",
						answers: ["push"],
					},
				},
				{
					type: "fill_blank",
					lesson: {
						question:
							"Digite a palavra que declara idade de um jeito que permite mudar o valor depois.",
						highlight: ["mudar o valor"],
						codeLanguage: "JavaScript",
						code: "___ idade = 20;\nidade = 21;",
						answers: ["let", "var"],
					},
				},
				{
					type: "fill_blank",
					lesson: {
						question: "Digite o tipo de total, que guarda um número.",
						highlight: ["tipo"],
						codeLanguage: "TypeScript",
						code: "let total: ___ = 10;",
						answers: ["number"],
					},
				},
			],
		},
	],
	en: [
		{
			title: "Test: type the answer (HTML and CSS)",
			classes: [
				{
					type: "fill_blank",
					lesson: {
						question:
							'Type the name of the paragraph tag that opens the text "Hi".',
						highlight: ["paragraph"],
						codeLanguage: "HTML",
						code: "<___>Hi</p>",
						answers: ["p"],
						ignoreCase: true,
					},
				},
				{
					type: "fill_blank",
					lesson: {
						question:
							"Type the property that colors the text of .card red.",
						highlight: ["property"],
						codeLanguage: "CSS",
						code: ".card {\n  ___: red;\n}",
						answers: ["color"],
						ignoreCase: true,
					},
				},
			],
		},
		{
			title: "Test: type the answer (JavaScript and TypeScript)",
			classes: [
				{
					type: "fill_blank",
					lesson: {
						question:
							"Type the method that adds 3 to the end of the nums array.",
						highlight: ["method"],
						codeLanguage: "JavaScript",
						code: "const nums = [1, 2];\nnums.___(3);\nconsole.log(nums);",
						answers: ["push"],
					},
				},
				{
					type: "fill_blank",
					lesson: {
						question:
							"Type the word that declares age in a way that lets the value change later.",
						highlight: ["value change"],
						codeLanguage: "JavaScript",
						code: "___ age = 20;\nage = 21;",
						answers: ["let", "var"],
					},
				},
				{
					type: "fill_blank",
					lesson: {
						question: "Type the type of total, which holds a number.",
						highlight: ["type of total"],
						codeLanguage: "TypeScript",
						code: "let total: ___ = 10;",
						answers: ["number"],
					},
				},
			],
		},
	],
};
