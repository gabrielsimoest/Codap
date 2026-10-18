import { ClassContent } from "../../../../../../types/entities";

const CHECK_PT = `(function () {
  __codap_check("Existe uma função somar", typeof somar === "function");
  var ok = false;
  try { ok = somar(10, -4) === 6 && somar(1.5, 1.5) === 3; } catch (e) {}
  __codap_check("somar devolve a soma de quaisquer dois números", ok);
  var e = window.__codapConsoleEntries;
  __codap_check("O console mostra 5", e.some(function (x) { return x.message === "5"; }));
})();`;

const CHECK_EN = `(function () {
  __codap_check("There is a function called sum", typeof sum === "function");
  var ok = false;
  try { ok = sum(10, -4) === 6 && sum(1.5, 1.5) === 3; } catch (e) {}
  __codap_check("sum returns the sum of any two numbers", ok);
  var e = window.__codapConsoleEntries;
  __codap_check("The console shows 5", e.some(function (x) { return x.message === "5"; }));
})();`;

/**
 * Aula de teste do `code_editor` no modal escondido (segurar "Sobre" por 5 s
 * em Configurações). Um desafio de JavaScript sem prévia: o `checkScript` chama
 * a função do aluno com outros valores (um `console.log(5)` sozinho não passa)
 * e serve para testar no aparelho a barra de símbolos, as aspas curvas e um
 * laço sem chaves digitado à mão (`while (true);`).
 */
export const editorTestLessons: ClassContent = {
	pt: [
		{
			title: "Teste: desafio (JavaScript)",
			classes: [
				{
					type: "code_editor",
					lesson: {
						question:
							"Crie uma função somar(a, b) que devolva a soma dos dois números e mostre somar(2, 3) no console.",
						highlight: ["devolva"],
						codeLanguage: "JavaScript",
						starterCode: "",
						checkScript: CHECK_PT,
						hints: [
							"Uma função começa com function, o nome e os parâmetros entre parênteses: function somar(a, b) { … }.",
							"Dentro da função, return a + b; devolve a soma. Depois, fora dela, console.log(somar(2, 3));",
						],
						solution: "function somar(a, b) {\n  return a + b;\n}\n\nconsole.log(somar(2, 3));",
					},
				},
			],
		},
	],
	en: [
		{
			title: "Test: challenge (JavaScript)",
			classes: [
				{
					type: "code_editor",
					lesson: {
						question:
							"Create a function sum(a, b) that returns the sum of the two numbers and show sum(2, 3) in the console.",
						highlight: ["returns"],
						codeLanguage: "JavaScript",
						starterCode: "",
						checkScript: CHECK_EN,
						hints: [
							"A function starts with function, the name and the parameters in parentheses: function sum(a, b) { … }.",
							"Inside the function, return a + b; gives back the sum. Then, outside it, console.log(sum(2, 3));",
						],
						solution: "function sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(2, 3));",
					},
				},
			],
		},
	],
};
