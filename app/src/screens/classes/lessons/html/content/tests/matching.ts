import { ClassContent } from "../../../../../../types/entities";

/**
 * Aulas de teste de `matching` no modal escondido (segurar "Sobre" por 5 s em
 * Configurações). Servem para exercitar o componente no emulador sem gravar
 * nada no banco. Cada aula: `{ title, classes: [{ type, lesson }] }`.
 *
 * Cobertura: 4 pares com `leftAsCode` (tag ↔ função), códigos de status HTTP
 * (também em monoespaçado), 3 pares sem `leftAsCode` (conceito ↔ definição) e
 * um lado direito no limite de 40 caracteres, que precisa quebrar sem cortar.
 */
export const matchingTestLessons: ClassContent = {
	pt: [
		{
			title: "Teste: ligar pares (código)",
			classes: [
				{
					type: "matching",
					lesson: {
						question: "Ligue cada tag à sua função.",
						highlight: ["tag"],
						leftAsCode: true,
						pairs: [
							{ left: "<p>", right: "Um parágrafo de texto" },
							{ left: "<a>", right: "Um link para outra página" },
							{ left: "<img>", right: "Uma imagem na página" },
							{ left: "<ul>", right: "Uma lista sem numeração" },
						],
					},
				},
				{
					type: "matching",
					lesson: {
						question: "Ligue cada código de status ao seu significado.",
						highlight: ["status"],
						leftAsCode: true,
						pairs: [
							{ left: "200", right: "Deu tudo certo" },
							{ left: "404", right: "Recurso não encontrado" },
							{ left: "500", right: "Erro interno do servidor" },
							{ left: "401", right: "Falta autenticação para acessar" },
						],
					},
				},
			],
		},
		{
			title: "Teste: ligar pares (conceitos)",
			classes: [
				{
					type: "matching",
					lesson: {
						question: "Ligue cada conceito à sua definição.",
						highlight: ["conceito"],
						pairs: [
							{ left: "Variável", right: "Guarda um valor que pode mudar" },
							{ left: "Função", right: "Bloco de código que pode ser reutilizado" },
							{ left: "Condicional", right: "Escolhe o que executar conforme o caso" },
						],
					},
				},
				{
					type: "matching",
					lesson: {
						question: "Ligue cada método HTTP ao que ele faz.",
						highlight: ["método"],
						leftAsCode: true,
						pairs: [
							{ left: "GET", right: "Buscar dados do servidor" },
							{ left: "POST", right: "Enviar dados para criar algo novo" },
							{ left: "DELETE", right: "Remover um recurso existente" },
						],
					},
				},
			],
		},
	],
	en: [
		{
			title: "Test: matching pairs (code)",
			classes: [
				{
					type: "matching",
					lesson: {
						question: "Match each tag to its purpose.",
						highlight: ["tag"],
						leftAsCode: true,
						pairs: [
							{ left: "<p>", right: "A paragraph of text" },
							{ left: "<a>", right: "A link to another page" },
							{ left: "<img>", right: "An image on the page" },
							{ left: "<ul>", right: "An unnumbered list" },
						],
					},
				},
				{
					type: "matching",
					lesson: {
						question: "Match each status code to its meaning.",
						highlight: ["status"],
						leftAsCode: true,
						pairs: [
							{ left: "200", right: "Everything went fine" },
							{ left: "404", right: "Resource not found" },
							{ left: "500", right: "Internal server error" },
							{ left: "401", right: "Authentication is required" },
						],
					},
				},
			],
		},
		{
			title: "Test: matching pairs (concepts)",
			classes: [
				{
					type: "matching",
					lesson: {
						question: "Match each concept to its definition.",
						highlight: ["concept"],
						pairs: [
							{ left: "Variable", right: "Stores a value that can change" },
							{ left: "Function", right: "A block of code you can reuse" },
							{ left: "Conditional", right: "Chooses what runs depending on the case" },
						],
					},
				},
				{
					type: "matching",
					lesson: {
						question: "Match each HTTP method to what it does.",
						highlight: ["method"],
						leftAsCode: true,
						pairs: [
							{ left: "GET", right: "Fetch data from the server" },
							{ left: "POST", right: "Send data to create something new" },
							{ left: "DELETE", right: "Remove an existing resource" },
						],
					},
				},
			],
		},
	],
};
