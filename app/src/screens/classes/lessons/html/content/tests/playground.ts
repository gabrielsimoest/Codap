import { ClassContent } from "../../../../../../types/entities";

/**
 * Aulas de teste do `code_playground` no modal escondido (segurar "Sobre" por
 * 5 s em Configurações). Cobrem a prévia de CSS/HTML corrigida pelo DOM, uma
 * correção por comportamento que aceita mais de uma resposta (4 + 6 ou 3 + 7)
 * e um distrator que cria um laço infinito — o watchdog precisa segurar.
 */
export const playgroundTestLessons: ClassContent = {
	pt: [
		{
			title: "Teste: playground (HTML e CSS)",
			classes: [
				{
					type: "code_playground",
					lesson: {
						question:
							'Complete a regra para o título "Olá" ficar vermelho (red) e toque em Executar.',
						highlight: ["vermelho"],
						codeLanguage: "CSS",
						code: "h1 {\n  ___: ___;\n}",
						blocks: ["color", "red", "background", "blue"],
						solution: ["color", "red"],
						html: "<h1>Olá</h1>",
						checkScript:
							'var c = getComputedStyle(document.querySelector("h1")).color;\n__codap_report(c === "rgb(255, 0, 0)", "O texto do título precisa ficar vermelho.");',
					},
				},
				{
					type: "code_playground",
					lesson: {
						question:
							'Complete o link para que ele leve à página sobre.html, com o texto "Sobre".',
						highlight: ["sobre.html"],
						codeLanguage: "HTML",
						code: '<a ___="sobre.html">\n  Sobre\n</a>',
						blocks: ["href", "src", "link"],
						solution: ["href"],
						checkScript:
							'var a = document.querySelector("a");\n__codap_report(!!a && a.getAttribute("href") === "sobre.html", "O link precisa apontar para sobre.html.");',
					},
				},
			],
		},
		{
			title: "Teste: playground (JavaScript)",
			classes: [
				{
					type: "code_playground",
					lesson: {
						question:
							"Escolha dois números que somados mostrem 10 no console. Há mais de uma resposta certa.",
						highlight: ["10"],
						codeLanguage: "JavaScript",
						code: "console.log(___ + ___);",
						blocks: ["4", "6", "3", "7", "5"],
						solution: ["4", "6"],
						checkScript:
							'var e = window.__codapConsoleEntries;\n__codap_report(e.length > 0 && e[e.length - 1].message === "10", "O console precisa mostrar 10.");',
					},
				},
				{
					type: "code_playground",
					lesson: {
						question:
							"Complete o laço para mostrar 0, 1 e 2 no console. Cuidado: um dos blocos faz o laço nunca acabar.",
						highlight: ["nunca acabar"],
						codeLanguage: "JavaScript",
						code: "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n  ___;\n}",
						blocks: ["i++", "i--"],
						solution: ["i++"],
						checkScript:
							'var e = window.__codapConsoleEntries.map(function (x) { return x.message; }).join(",");\n__codap_report(e === "0,1,2", "O console precisa mostrar 0, 1 e 2.");',
					},
				},
			],
		},
	],
	en: [
		{
			title: "Test: playground (HTML and CSS)",
			classes: [
				{
					type: "code_playground",
					lesson: {
						question:
							'Complete the rule so the heading "Hello" turns red, then tap Run.',
						highlight: ["red"],
						codeLanguage: "CSS",
						code: "h1 {\n  ___: ___;\n}",
						blocks: ["color", "red", "background", "blue"],
						solution: ["color", "red"],
						html: "<h1>Hello</h1>",
						checkScript:
							'var c = getComputedStyle(document.querySelector("h1")).color;\n__codap_report(c === "rgb(255, 0, 0)", "The heading text needs to be red.");',
					},
				},
				{
					type: "code_playground",
					lesson: {
						question:
							'Complete the link so it goes to the about.html page, with the text "About".',
						highlight: ["about.html"],
						codeLanguage: "HTML",
						code: '<a ___="about.html">\n  About\n</a>',
						blocks: ["href", "src", "link"],
						solution: ["href"],
						checkScript:
							'var a = document.querySelector("a");\n__codap_report(!!a && a.getAttribute("href") === "about.html", "The link needs to point to about.html.");',
					},
				},
			],
		},
		{
			title: "Test: playground (JavaScript)",
			classes: [
				{
					type: "code_playground",
					lesson: {
						question:
							"Pick two numbers that add up to 10 in the console. There is more than one right answer.",
						highlight: ["10"],
						codeLanguage: "JavaScript",
						code: "console.log(___ + ___);",
						blocks: ["4", "6", "3", "7", "5"],
						solution: ["4", "6"],
						checkScript:
							'var e = window.__codapConsoleEntries;\n__codap_report(e.length > 0 && e[e.length - 1].message === "10", "The console needs to show 10.");',
					},
				},
				{
					type: "code_playground",
					lesson: {
						question:
							"Complete the loop to show 0, 1 and 2 in the console. Careful: one of the blocks makes the loop never end.",
						highlight: ["never end"],
						codeLanguage: "JavaScript",
						code: "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n  ___;\n}",
						blocks: ["i++", "i--"],
						solution: ["i++"],
						checkScript:
							'var e = window.__codapConsoleEntries.map(function (x) { return x.message; }).join(",");\n__codap_report(e === "0,1,2", "The console needs to show 0, 1 and 2.");',
					},
				},
			],
		},
	],
};
