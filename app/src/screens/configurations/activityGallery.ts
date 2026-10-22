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
		title: "Teoria · referência do Figma",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Olá, aqui é o Cody!",
					persona: "cody",
					text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar, arcu quis congue maximus, augue quam eleifend risus, nec rhoncus metus dui sed elit. Donec sed semper lacus, sed varius.",
				},
				explanation: {
					title: "O que é o HTML?",
					text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar, arcu quis congue maximus, augue quam eleifend risus, nec rhoncus metus dui sed elit. Donec sed semper lacus, sed varius.",
				},
				closing:
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar, arcu quis congue maximus, augue quam eleifend risus, nec rhoncus metus dui sed elit. Donec sed semper lacus, sed varius.",
				highlight: ["Cody", "HTML", "pulvinar"],
				codeLanguage: "HTML",
				code: "<!DOCTYPE html>\n\n<html>\n   <body>\n      <h1>Olá Mundo!</h1>\n      <p>Este é o HTML</p>\n   </body>\n</html>\n",
			},
		},
	},
	{
		title: "Teoria · Cody completa",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Como uma página sabe o que mostrar?",
					persona: "cody",
					text: "Você já reparou que toda página começa com a mesma estrutura, mesmo quando o conteúdo é totalmente diferente? Vamos descobrir como o HTML organiza títulos e botões, e como o CSS e o JavaScript entram nessa conversa.",
				},
				explanation: {
					title: "Três linguagens, uma página",
					text: "O HTML define a estrutura, o CSS cuida da aparência e o JavaScript adiciona comportamento. Cada uma tem a sua aba no editor; a aba Web junta as três e executa o JavaScript de verdade: toque no botão da prévia.",
				},
				closing:
					"Repare que o HTML não mudou para o título ficar azul: o CSS fez isso sozinho. Separar as responsabilidades é o que mantém uma página fácil de mudar.",
				highlight: ["HTML", "CSS", "JavaScript", "estrutura", "Web"],
				codeLanguage: "HTML",
				code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Galeria</title>\n  </head>\n  <body>\n    <h1 id="titulo">Galeria</h1>\n    <button id="botao">\n      Clique\n    </button>\n  </body>\n</html>',
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
		title: "Teoria · neutra + terminal",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Repetindo ações com for...of",
					persona: "neutral",
					text: "O laço for...of percorre cada item de uma lista, na ordem em que eles aparecem, e executa o mesmo bloco de código para cada um.",
				},
				explanation: {
					title: "Do primeiro ao último item",
					text: "A cada volta, a variável do laço guarda o item atual. Quando a lista acaba, o laço termina sozinho: não é preciso contar posições nem controlar o fim.",
				},
				closing: "Toque em Executar: o console mostra um item por linha, na mesma ordem da lista.",
				highlight: ["for...of", "lista", "Executar"],
				codeLanguage: "JavaScript",
				code: 'const itens = ["HTML", "CSS", "JS"];\n\nfor (const item of itens) {\n  console.log(item);\n}',
				onlyCode: true,
			},
		},
	},
	{
		title: "Teoria · Cody, TypeScript, sem explicação",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "O que muda quando o código ganha tipos?",
					persona: "cody",
					text: "Você já passou o valor errado para uma função sem perceber? O TypeScript avisa isso antes de o código rodar. Que tal ver como ele descreve o que cada parâmetro aceita?",
				},
				closing:
					"O app não executa TypeScript: o terminalCode guarda a versão em JavaScript do mesmo código, e é ela que o Executar roda.",
				highlight: ["TypeScript", "terminalCode", "Executar"],
				codeLanguage: "TypeScript",
				code: "function somar(a: number, b: number): number {\n  return a + b;\n}\n\nconsole.log(somar(2, 3));",
				terminalCode: "function somar(a, b) {\n  return a + b;\n}\n\nconsole.log(somar(2, 3));",
				onlyCode: true,
			},
		},
	},
	{
		title: "Teoria · neutra mínima",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Exportando uma função",
					persona: "neutral",
					text: "A palavra export deixa uma função disponível para outros arquivos. Esta é a teoria mais curta possível: sem explicação, sem card complementar e sem o botão Executar, por causa do noTerminal.",
				},
				highlight: ["export", "noTerminal"],
				codeLanguage: "JavaScript",
				code: "export function dobrar(n) {\n  return n * 2;\n}",
				onlyCode: true,
				noTerminal: true,
			},
		},
	},
	{
		title: "Teoria · textos longos",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Como o navegador transforma texto em uma página que você consegue usar",
					persona: "cody",
					text: "Quando você abre um endereço, o navegador recebe apenas texto: um arquivo cheio de marcas entre sinais de menor e maior. Mesmo assim, o que aparece na tela tem títulos, imagens, botões e cores. Você consegue imaginar como esse texto vira uma página? Vamos acompanhar esse caminho passo a passo, do primeiro caractere recebido até o último pixel desenhado.",
				},
				explanation: {
					title: "Leitura, árvore e desenho",
					text: "Primeiro o navegador lê o HTML de cima para baixo e monta uma árvore: cada tag vira um nó, e cada nó sabe quem são seus filhos. Depois aplica as regras de CSS sobre essa árvore para descobrir cor, tamanho e posição de cada nó. Por fim, desenha o resultado na tela e fica de olho no JavaScript, que pode mudar a árvore a qualquer momento e pedir um novo desenho.",
				},
				closing:
					"Um erro comum é achar que o navegador mostra o arquivo como ele foi escrito. Ele mostra a árvore montada a partir dele, e é por isso que uma tag esquecida pode mudar a página inteira sem nenhum aviso. Quando algo parecer estranho, abra o código e confira se cada tag que foi aberta também foi fechada.",
				highlight: ["navegador", "árvore", "CSS", "JavaScript", "tag"],
				codeLanguage: "HTML",
				code: '<!DOCTYPE html>\n<html lang="pt-BR">\n  <head>\n    <meta charset="UTF-8">\n    <title>Minha página</title>\n  </head>\n  <body>\n    <header>\n      <h1>Minha página</h1>\n      <nav>\n        <a href="/">Início</a>\n        <a href="/sobre">Sobre</a>\n      </nav>\n    </header>\n    <main>\n      <h2>Bem-vindo</h2>\n      <p>Este texto vira um nó.</p>\n      <ul>\n        <li>Primeiro</li>\n        <li>Segundo</li>\n      </ul>\n    </main>\n    <footer>\n      <p>Feito com HTML</p>\n    </footer>\n  </body>\n</html>',
				onlyCode: true,
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
		title: "Theory · Figma reference",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Olá, aqui é o Cody!",
					persona: "cody",
					text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar, arcu quis congue maximus, augue quam eleifend risus, nec rhoncus metus dui sed elit. Donec sed semper lacus, sed varius.",
				},
				explanation: {
					title: "O que é o HTML?",
					text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar, arcu quis congue maximus, augue quam eleifend risus, nec rhoncus metus dui sed elit. Donec sed semper lacus, sed varius.",
				},
				closing:
					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pulvinar, arcu quis congue maximus, augue quam eleifend risus, nec rhoncus metus dui sed elit. Donec sed semper lacus, sed varius.",
				highlight: ["Cody", "HTML", "pulvinar"],
				codeLanguage: "HTML",
				code: "<!DOCTYPE html>\n\n<html>\n   <body>\n      <h1>Olá Mundo!</h1>\n      <p>Este é o HTML</p>\n   </body>\n</html>\n",
			},
		},
	},
	{
		title: "Theory · full Cody",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "How does a page know what to show?",
					persona: "cody",
					text: "Have you noticed that every page starts with the same structure, even when the content is completely different? Let's find out how HTML organizes headings and buttons, and how CSS and JavaScript join the conversation.",
				},
				explanation: {
					title: "Three languages, one page",
					text: "HTML defines the structure, CSS takes care of the look and JavaScript adds behavior. Each one has its own tab in the editor; the Web tab combines all three and really runs the JavaScript: tap the button in the preview.",
				},
				closing:
					"Notice that the HTML did not change for the heading to turn blue: CSS did that on its own. Keeping responsibilities apart is what keeps a page easy to change.",
				highlight: ["HTML", "CSS", "JavaScript", "structure", "Web"],
				codeLanguage: "HTML",
				code: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Gallery</title>\n  </head>\n  <body>\n    <h1 id="title">Gallery</h1>\n    <button id="button">\n      Click\n    </button>\n  </body>\n</html>',
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
		title: "Theory · neutral + terminal",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Repeating actions with for...of",
					persona: "neutral",
					text: "The for...of loop goes through each item of a list, in the order they appear, and runs the same block of code for each one.",
				},
				explanation: {
					title: "From the first item to the last",
					text: "On each turn, the loop variable holds the current item. When the list ends, the loop stops by itself: there is no need to count positions or control the end.",
				},
				closing: "Tap Run: the console shows one item per line, in the same order as the list.",
				highlight: ["for...of", "list", "Run"],
				codeLanguage: "JavaScript",
				code: 'const items = ["HTML", "CSS", "JS"];\n\nfor (const item of items) {\n  console.log(item);\n}',
				onlyCode: true,
			},
		},
	},
	{
		title: "Theory · Cody, TypeScript, no explanation",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "What changes when code gets types?",
					persona: "cody",
					text: "Have you ever passed the wrong value to a function without noticing? TypeScript warns you before the code runs. How about seeing how it describes what each parameter accepts?",
				},
				closing:
					"The app does not run TypeScript: terminalCode keeps the JavaScript version of the same code, and that is what Run executes.",
				highlight: ["TypeScript", "terminalCode", "Run"],
				codeLanguage: "TypeScript",
				code: "function sum(a: number, b: number): number {\n  return a + b;\n}\n\nconsole.log(sum(2, 3));",
				terminalCode: "function sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(2, 3));",
				onlyCode: true,
			},
		},
	},
	{
		title: "Theory · minimal neutral",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "Exporting a function",
					persona: "neutral",
					text: "The export keyword makes a function available to other files. This is the shortest possible theory: no explanation, no complementary card and no Run button, because of noTerminal.",
				},
				highlight: ["export", "noTerminal"],
				codeLanguage: "JavaScript",
				code: "export function double(n) {\n  return n * 2;\n}",
				onlyCode: true,
				noTerminal: true,
			},
		},
	},
	{
		title: "Theory · long texts",
		activity: {
			type: "theory",
			lesson: {
				introduction: {
					title: "How the browser turns text into a page you can actually use",
					persona: "cody",
					text: "When you open an address, the browser receives nothing but text: a file full of marks between less-than and greater-than signs. Even so, what shows up on screen has headings, images, buttons and colors. Can you imagine how that text becomes a page? Let's follow that path step by step, from the first character received to the last pixel drawn.",
				},
				explanation: {
					title: "Reading, tree and painting",
					text: "First the browser reads the HTML from top to bottom and builds a tree: each tag becomes a node, and each node knows who its children are. Then it applies the CSS rules over that tree to find out the color, size and position of every node. Finally it paints the result on screen and keeps an eye on JavaScript, which can change the tree at any moment and ask for a new painting.",
				},
				closing:
					"A common mistake is to think the browser shows the file as it was written. It shows the tree built from it, which is why a forgotten tag can change the whole page without any warning. When something looks odd, open the code and check that every tag that was opened was also closed.",
				highlight: ["browser", "tree", "CSS", "JavaScript", "tag"],
				codeLanguage: "HTML",
				code: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <title>My page</title>\n  </head>\n  <body>\n    <header>\n      <h1>My page</h1>\n      <nav>\n        <a href="/">Home</a>\n        <a href="/about">About</a>\n      </nav>\n    </header>\n    <main>\n      <h2>Welcome</h2>\n      <p>This text becomes a node.</p>\n      <ul>\n        <li>First</li>\n        <li>Second</li>\n      </ul>\n    </main>\n    <footer>\n      <p>Made with HTML</p>\n    </footer>\n  </body>\n</html>',
				onlyCode: true,
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
