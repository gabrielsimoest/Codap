import { DefaultTheme } from "@react-navigation/native";

/**
 * Tema claro: a contraparte "luz do dia" do azul-marinho do tema escuro.
 *
 * Mesma família de matiz do escuro (neutros azulados, nunca cinza puro nem
 * branco chapado) e a mesma marca índigo (`#5469D3`). A elevação segue a
 * lógica do escuro — a superfície elevada (`primary`) é mais clara que o fundo —
 * e os papéis têm o mesmo significado:
 *
 * - `background`: tela. Um azul-gelo bem leve, para o branco dos cartões se
 *   destacar sem depender só de sombra.
 * - `primary`: superfície elevada (cartões, itens de lista, modais, botões neutros).
 * - `card`: superfície rebaixada (seletores, placeholders), mais escura que a tela.
 * - `border`: contornos e divisores decorativos. Não serve de contorno de campo
 *   de texto (1,4:1 com a tela) — para isso use `useAppColors().fieldBorder`.
 * - `notification`: fundo neutro de avatar/ícone.
 * - `text`: tinta azul-marinho (a cor de fundo do escuro), 15:1 com a tela.
 *
 * Contrastes (WCAG): `text` 15,4:1 na tela e 16,7:1 no branco; a marca sobre
 * texto branco 4,84:1. Ver `appColors.ts` para o que não cabe nos papéis do
 * React Navigation (texto secundário, marca como texto, campos).
 */
const LightMode = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: "#F3F6FB",
		text: "#141F29",
		primary: "#FFFFFF",
		card: "#E8EEF7",
		border: "#CCD6E6",
		notification: "#E1E8F3",
	},
};

export default LightMode;
