import type { ClassContent, Classes, Content } from "../../types/entities";

/**
 * Galeria de atividades do modal escondido (Configurações → segurar "Sobre"
 * por 5 s): um exemplar funcional de cada tela de atividade, com todos os
 * campos que o componente usa preenchidos, para revisar e reformular o visual.
 * Não é conteúdo pedagógico — o currículo vem da API (ver `api/prisma/seed.ts`).
 *
 * Fora daqui ficam só campos que agem no sorteio da sessão (`pool`, `draw`,
 * `fixedOrder`), que a galeria não usa: ela mostra as telas na ordem abaixo.
 *
 * A primeira entrada é a sequência completa; depois vem uma entrada por tela,
 * para abrir direto a que estiver sendo revisada.
 */

interface GalleryItem {
	title: string;
	activity: Classes;
}

function gallery(all: string, items: GalleryItem[]): Content[] {
	return [
		{ title: all, classes: items.map((item) => item.activity) },
		...items.map((item) => ({ title: item.title, classes: [item.activity] })),
	];
}

const pt: GalleryItem[] = [
	{
		title: "Teoria · aba Web",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"Esta é a galeria de atividades: um exemplar de cada tela, para revisar o visual. Esta teoria usa os quatro parágrafos e um código com HTML, CSS e JavaScript.",
				secondParagraph:
					"Cada linguagem tem a sua aba. A aba Web junta as três e executa o JavaScript de verdade: toque no botão da prévia.",
				thirdParagraph:
					"As palavras em destaque, como HTML, CSS e JavaScript, vêm da lista highlight.",
				endParagraph: "O último parágrafo aparece depois do código.",
				highlight: ["galeria", "HTML", "CSS", "JavaScript", "Web"],
				codeLanguage: "HTML",
				code: '<h1 id="titulo">Galeria</h1>\n<button id="botao">\n  Clique\n</button>',
				additionalCode: [
					{
						codeLanguage: "CSS",
						code: "h1 {\n  color: #5469D3;\n}\n\nbutton {\n  padding: 8px 16px;\n}",
					},
					{
						codeLanguage: "JavaScript",
						code: 'const botao =\n  document.querySelector("#botao");\n\nbotao.addEventListener("click", () => {\n  document.querySelector("#titulo")\n    .textContent = "Clicou!";\n});\n\nconsole.log("Página pronta");',
					},
				],
				tutorial: true,
			},
		},
	},
	{
		title: "Teoria · terminal",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"Uma teoria só de JavaScript, sem HTML, ganha o botão Executar: a saída do console aparece logo abaixo do código.",
				endParagraph: "Toque em Executar para ver as três linhas.",
				highlight: ["Executar", "console"],
				codeLanguage: "JavaScript",
				code: 'const itens = ["HTML", "CSS", "JS"];\n\nfor (const item of itens) {\n  console.log(item);\n}',
				onlyCode: true,
			},
		},
	},
	{
		title: "Teoria · TypeScript",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"TypeScript não roda no app. O terminalCode guarda a versão em JavaScript do mesmo código, e é ela que o Executar roda.",
				highlight: ["terminalCode", "Executar"],
				codeLanguage: "TypeScript",
				code: "function somar(a: number, b: number): number {\n  return a + b;\n}\n\nconsole.log(somar(2, 3));",
				terminalCode: "function somar(a, b) {\n  return a + b;\n}\n\nconsole.log(somar(2, 3));",
				onlyCode: true,
			},
		},
	},
	{
		title: "Teoria · sem terminal",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"Com noTerminal, um bloco de JavaScript fica sem o botão Executar: serve para código que não mostra nada no console, como um export.",
				highlight: ["noTerminal"],
				codeLanguage: "JavaScript",
				code: "export function dobrar(n) {\n  return n * 2;\n}",
				onlyCode: true,
				noTerminal: true,
			},
		},
	},
	{
		title: "Múltipla escolha",
		activity: {
			type: "option",
			lesson: {
				question: "Qual tag cria o título principal da página?",
				aditionalParagraph: "Toda página tem um título principal, o maior destaque do conteúdo.",
				highlight: ["título principal"],
				code: "<h1>Galeria</h1>\n<p>Um parágrafo.</p>",
				codeLanguage: "HTML",
				options: ["<h1>", "<p>", "<title>", "<header>"],
				correctOption: 1,
				tutorial: true,
			},
		},
	},
	{
		title: "Ache o erro (alternativas em código)",
		activity: {
			type: "option",
			lesson: {
				question: "Qual trecho fecha a tag do parágrafo corretamente?",
				aditionalParagraph: "Um parágrafo abre com <p> e fecha com a mesma tag, com uma barra.",
				highlight: ["corretamente"],
				codeLanguage: "HTML",
				options: ["<p>Oi</p>", "<p>Oi<p>", "<p>Oi</ p>", "<p>Oi</P"],
				correctOption: 1,
				optionsAsCode: true,
				tutorial: true,
			},
		},
	},
	{
		title: "Completar código (blocos)",
		activity: {
			type: "code_blank",
			lesson: {
				question: 'Complete: um link para sobre.html com o texto "Sobre".',
				highlight: ["link"],
				codeLanguage: "HTML",
				code: '<a ___="sobre.html">\n  ___\n</a>',
				answers: ["href", "Sobre"],
				distractors: ["src", "Início"],
				tutorial: true,
			},
		},
	},
	{
		title: "Digitar a resposta",
		activity: {
			type: "fill_blank",
			lesson: {
				question: "Digite a palavra que declara uma variável que pode mudar de valor.",
				highlight: ["mudar de valor"],
				codeLanguage: "JavaScript",
				code: "___ total = 0;\ntotal = 10;",
				answers: ["let", "var"],
				ignoreCase: true,
				tutorial: true,
			},
		},
	},
	{
		title: "Montar o código",
		activity: {
			type: "reorder",
			lesson: {
				question: "Monte a função que devolve o dobro do número.",
				highlight: ["dobro"],
				codeLanguage: "JavaScript",
				lines: ["function dobro(n) {", "  return n * 2;", "}"],
				distractors: ["  return n + 2;"],
				tutorial: true,
			},
		},
	},
	{
		title: "Ligar pares",
		activity: {
			type: "matching",
			lesson: {
				question: "Ligue cada tag ao que ela representa.",
				highlight: ["tag"],
				pairs: [
					{ left: "<h1>", right: "Título principal" },
					{ left: "<p>", right: "Parágrafo" },
					{ left: "<a>", right: "Link" },
					{ left: "<img>", right: "Imagem" },
				],
				leftAsCode: true,
				tutorial: true,
			},
		},
	},
	{
		title: "Playground (blocos + execução)",
		activity: {
			type: "code_playground",
			lesson: {
				question:
					"Complete a regra para o título ficar azul (blue) e com 32px de tamanho, e toque em Executar.",
				highlight: ["azul", "32px"],
				codeLanguage: "CSS",
				code: "h1 {\n  ___: blue;\n  font-size: ___;\n}",
				blocks: ["color", "32px", "background", "16px"],
				solution: ["color", "32px"],
				html: "<h1>Galeria</h1>",
				js: 'console.log("Estilo aplicado");',
				checkScript:
					'(function () {\n  var st = getComputedStyle(document.querySelector("h1"));\n  __codap_report(st.color === "rgb(0, 0, 255)" && st.fontSize === "32px", "O título precisa ficar azul e com 32px.");\n})();',
				tutorial: true,
			},
		},
	},
	{
		title: "Desafio do módulo (editor)",
		activity: {
			type: "code_editor",
			lesson: {
				question:
					'Abaixo do título, escreva um parágrafo com o texto "Olá, galeria!" e um botão "Enviar".',
				highlight: ["parágrafo", "botão"],
				codeLanguage: "HTML",
				starterCode: "<h1>Galeria</h1>\n\n",
				css: "p {\n  color: #5469D3;\n}",
				js: 'console.log("Página carregada");',
				checkScript:
					'(function () {\n  var p = document.querySelector("p");\n  __codap_check(\'Um parágrafo "Olá, galeria!"\', !!p && p.textContent.trim() === "Olá, galeria!");\n  var b = document.querySelector("button");\n  __codap_check(\'Um botão "Enviar"\', !!b && b.textContent.trim() === "Enviar");\n})();',
				hints: [
					"Um parágrafo usa a tag <p>, e um botão, a tag <button>.",
					"Os dois vão depois do </h1>, cada um com o próprio fechamento.",
					"<p>Olá, galeria!</p> e, na linha seguinte, <button>Enviar</button>.",
				],
				solution: "<h1>Galeria</h1>\n\n<p>Olá, galeria!</p>\n<button>Enviar</button>",
			},
		},
	},
];

const en: GalleryItem[] = [
	{
		title: "Theory · Web tab",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"This is the activity gallery: one sample of each screen, to review the visuals. This theory uses all four paragraphs and code with HTML, CSS and JavaScript.",
				secondParagraph:
					"Each language has its own tab. The Web tab combines all three and really runs the JavaScript: tap the button in the preview.",
				thirdParagraph:
					"Highlighted words, like HTML, CSS and JavaScript, come from the highlight list.",
				endParagraph: "The last paragraph shows up after the code.",
				highlight: ["gallery", "HTML", "CSS", "JavaScript", "Web"],
				codeLanguage: "HTML",
				code: '<h1 id="title">Gallery</h1>\n<button id="button">\n  Click\n</button>',
				additionalCode: [
					{
						codeLanguage: "CSS",
						code: "h1 {\n  color: #5469D3;\n}\n\nbutton {\n  padding: 8px 16px;\n}",
					},
					{
						codeLanguage: "JavaScript",
						code: 'const button =\n  document.querySelector("#button");\n\nbutton.addEventListener("click", () => {\n  document.querySelector("#title")\n    .textContent = "Clicked!";\n});\n\nconsole.log("Page ready");',
					},
				],
				tutorial: true,
			},
		},
	},
	{
		title: "Theory · terminal",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"A JavaScript-only theory, with no HTML, gets the Run button: the console output shows up right below the code.",
				endParagraph: "Tap Run to see the three lines.",
				highlight: ["Run", "console"],
				codeLanguage: "JavaScript",
				code: 'const items = ["HTML", "CSS", "JS"];\n\nfor (const item of items) {\n  console.log(item);\n}',
				onlyCode: true,
			},
		},
	},
	{
		title: "Theory · TypeScript",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"TypeScript does not run in the app. terminalCode keeps the JavaScript version of the same code, and that is what Run executes.",
				highlight: ["terminalCode", "Run"],
				codeLanguage: "TypeScript",
				code: "function sum(a: number, b: number): number {\n  return a + b;\n}\n\nconsole.log(sum(2, 3));",
				terminalCode: "function sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(2, 3));",
				onlyCode: true,
			},
		},
	},
	{
		title: "Theory · no terminal",
		activity: {
			type: "theory",
			lesson: {
				firstParagraph:
					"With noTerminal, a JavaScript block has no Run button: it is for code that shows nothing in the console, like an export.",
				highlight: ["noTerminal"],
				codeLanguage: "JavaScript",
				code: "export function double(n) {\n  return n * 2;\n}",
				onlyCode: true,
				noTerminal: true,
			},
		},
	},
	{
		title: "Multiple choice",
		activity: {
			type: "option",
			lesson: {
				question: "Which tag creates the main heading of the page?",
				aditionalParagraph: "Every page has a main heading, the most prominent part of the content.",
				highlight: ["main heading"],
				code: "<h1>Gallery</h1>\n<p>A paragraph.</p>",
				codeLanguage: "HTML",
				options: ["<h1>", "<p>", "<title>", "<header>"],
				correctOption: 1,
				tutorial: true,
			},
		},
	},
	{
		title: "Find the bug (options as code)",
		activity: {
			type: "option",
			lesson: {
				question: "Which snippet closes the paragraph tag correctly?",
				aditionalParagraph: "A paragraph opens with <p> and closes with the same tag, with a slash.",
				highlight: ["correctly"],
				codeLanguage: "HTML",
				options: ["<p>Hi</p>", "<p>Hi<p>", "<p>Hi</ p>", "<p>Hi</P"],
				correctOption: 1,
				optionsAsCode: true,
				tutorial: true,
			},
		},
	},
	{
		title: "Complete the code (blocks)",
		activity: {
			type: "code_blank",
			lesson: {
				question: 'Complete it: a link to about.html with the text "About".',
				highlight: ["link"],
				codeLanguage: "HTML",
				code: '<a ___="about.html">\n  ___\n</a>',
				answers: ["href", "About"],
				distractors: ["src", "Home"],
				tutorial: true,
			},
		},
	},
	{
		title: "Type the answer",
		activity: {
			type: "fill_blank",
			lesson: {
				question: "Type the word that declares a variable whose value can change.",
				highlight: ["can change"],
				codeLanguage: "JavaScript",
				code: "___ total = 0;\ntotal = 10;",
				answers: ["let", "var"],
				ignoreCase: true,
				tutorial: true,
			},
		},
	},
	{
		title: "Build the code",
		activity: {
			type: "reorder",
			lesson: {
				question: "Build the function that returns double the number.",
				highlight: ["double"],
				codeLanguage: "JavaScript",
				lines: ["function double(n) {", "  return n * 2;", "}"],
				distractors: ["  return n + 2;"],
				tutorial: true,
			},
		},
	},
	{
		title: "Match the pairs",
		activity: {
			type: "matching",
			lesson: {
				question: "Match each tag to what it represents.",
				highlight: ["tag"],
				pairs: [
					{ left: "<h1>", right: "Main heading" },
					{ left: "<p>", right: "Paragraph" },
					{ left: "<a>", right: "Link" },
					{ left: "<img>", right: "Image" },
				],
				leftAsCode: true,
				tutorial: true,
			},
		},
	},
	{
		title: "Playground (blocks + run)",
		activity: {
			type: "code_playground",
			lesson: {
				question: "Complete the rule so the heading is blue and 32px in size, then tap Run.",
				highlight: ["blue", "32px"],
				codeLanguage: "CSS",
				code: "h1 {\n  ___: blue;\n  font-size: ___;\n}",
				blocks: ["color", "32px", "background", "16px"],
				solution: ["color", "32px"],
				html: "<h1>Gallery</h1>",
				js: 'console.log("Style applied");',
				checkScript:
					'(function () {\n  var st = getComputedStyle(document.querySelector("h1"));\n  __codap_report(st.color === "rgb(0, 0, 255)" && st.fontSize === "32px", "The heading needs to be blue and 32px.");\n})();',
				tutorial: true,
			},
		},
	},
	{
		title: "Module challenge (editor)",
		activity: {
			type: "code_editor",
			lesson: {
				question: 'Below the heading, write a paragraph with the text "Hello, gallery!" and a "Send" button.',
				highlight: ["paragraph", "button"],
				codeLanguage: "HTML",
				starterCode: "<h1>Gallery</h1>\n\n",
				css: "p {\n  color: #5469D3;\n}",
				js: 'console.log("Page loaded");',
				checkScript:
					'(function () {\n  var p = document.querySelector("p");\n  __codap_check(\'A paragraph "Hello, gallery!"\', !!p && p.textContent.trim() === "Hello, gallery!");\n  var b = document.querySelector("button");\n  __codap_check(\'A "Send" button\', !!b && b.textContent.trim() === "Send");\n})();',
				hints: [
					"A paragraph uses the <p> tag, and a button, the <button> tag.",
					"Both go after </h1>, each with its own closing tag.",
					"<p>Hello, gallery!</p> and, on the next line, <button>Send</button>.",
				],
				solution: "<h1>Gallery</h1>\n\n<p>Hello, gallery!</p>\n<button>Send</button>",
			},
		},
	},
];

export const activityGallery: ClassContent = {
	pt: gallery("Sequência completa", pt),
	en: gallery("Full sequence", en),
};
