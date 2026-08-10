import { ClassContent } from "../../../../../types/entities";

const codeList = {
	structure: `<!DOCTYPE html>
  <html>
    <head>
      <title>Minha página</title>
    </head>
    <body>
      <h1>Minha página</h1>
      <p>Esta é a minha primeira página HTML!</p>
    </body>
  </html>`,
};

const BasicHtmlLessons: ClassContent = {
	pt: [
		{
			title: "Descobrindo HTML",
			classes: [
				{
					type: "theory",
					lesson: {
						firstParagraph:
							"Olá, aqui é o Cody. Vamos aprender HTML? O HTML é uma linguagem de marcação muito utilizada na construção de páginas na Web.",
						secondParagraph:
							"Primeiramente estarei mostrando um exemplo bem básico de estrutura para você já ir tendo uma ideia de como o HTML se parece.",
						endParagraph:
							"Como você pôde ver ela é bem simples, mas existem vários outros elementos que podem ser adicionados nessa estrutura para termos sites incríveis.",
						highlight: ["HTML", "Cody", "Web"],
						codeLanguage: "HTML",
						code: codeList.structure,
					},
				},
				{
					type: "theory",
					lesson: {
						firstParagraph:
							"Agora que vimos a estrutura, vamos entender melhor o que está nela.",
						secondParagraph:
							"A estrutura é formada por tags de abertura e fechamento, que são indicadas por essas setas <>. Dentro delas vai o nome do elemento.",
						endParagraph:
							"Lembre-se, a estrutura DEVE estar entre as tags <html> </html>. Se não seu site não vai funcionar!",
						highlight: ["HTML", "DEVE"],
						codeLanguage: "HTML",
						code: codeList.structure,
					},
				},
				{
					type: "option",
					lesson: {
						question:
							"<html> representa uma tag de abertura, como seria uma tag de fechamento?",
						highlight: ["HTML"],
						options: ["<html>", "<end html>", ">html<", "</html>"],
						correctOption: 4,
					},
				},
			],
		},
	],
	en: [
		{
			title: "Discovering HTML",
			classes: [
				{
					type: "theory",
					lesson: {
						firstParagraph:
							"Olá, aqui é o Cody. Vamos aprender HTML? O HTML é uma linguagem de marcação muito utilizada na construção de páginas na Web.",
						secondParagraph:
							"Primeiramente estarei mostrando um exemplo bem básico de estrutura para você já ir tendo uma ideia de como o HTML se parece.",
						endParagraph:
							"Como você pôde ver ela é bem simples, mas existem vários outros elementos que podem ser adicionados nessa estrutura para termos sites incríveis.",
						highlight: ["HTML", "Cody"],
						codeLanguage: "HTML",
						code: codeList.structure,
					},
				},
				{
					type: "theory",
					lesson: {
						firstParagraph:
							"Agora que vimos a estrutura, vamos entender melhor o que está nela.",
						secondParagraph:
							"A estrutura é formada por tags de abertura e fechamento, que são indicadas por essas setas <>. Dentro delas vai o nome do elemento.",
						endParagraph:
							"Lembre-se, a estrutura DEVE estar entre as tags <html> </html>. Se não seu site não vai funcionar!",
						highlight: ["HTML"],
						codeLanguage: "HTML",
						code: codeList.structure,
					},
				},
			],
		},
	],
};

export default BasicHtmlLessons;
