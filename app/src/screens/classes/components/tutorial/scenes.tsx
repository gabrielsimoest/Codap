import { Fragment } from "react";
import { Image } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/Icon";
import type { TheoryPalette } from "../theory/theoryTheme";
import { Bar, Box, Canvas, Finger, Label, Mono, Span, useFrame } from "./tutorialKit";

/**
 * Cenas dos tutoriais: ilustrações animadas e curtas de como se faz cada atividade.
 * Cada cena desenha, numa área fixa (`CANVAS_W` × `CANVAS_H`), um laço de quadros — o
 * dedo desliza até um alvo, "toca" e o desenho muda. Com "reduzir movimento" a cena
 * para no **último** quadro, que sempre é o estado final já resolvido.
 *
 * As ilustrações usam as cores da paleta das telas de teoria, então seguem o tema
 * claro/escuro. Os textos dentro do desenho são de tamanho fixo (não acompanham a
 * escala de fonte do app): são figura, não leitura — a leitura fica no texto do passo.
 */

interface SceneProps {
	palette: TheoryPalette;
}

// Cores de sintaxe do realce de código do app (Dracula adaptado).
const TAG = "#FF79C6";
const ATTR = "#50FA7B";
const STR = "#F1FA8C";

/** Cor das barras que representam texto ainda sem importância. */
const dim = (p: TheoryPalette) => (p.isDark ? "rgba(255,255,255,0.22)" : "rgba(20,31,41,0.2)");

/** O quadro em que cada toque acontece vira a chave do anel do dedo; os demais quadros não tocam. */
const tapOn = (frame: number, taps: number[]) => (taps.includes(frame) ? frame : null);

// ---------------------------------------------------------------------------
// Teoria
// ---------------------------------------------------------------------------

/** Teoria 1 — o Cody apresenta a ideia e as palavras importantes ganham destaque. */
export function TheoryReadScene({ palette: p }: SceneProps) {
	const frame = useFrame([900, 1500]);
	const on = frame === 1;
	const line = dim(p);
	return (
		<Canvas palette={p}>
			<Image
				source={require("../../../../../assets/cody_thinking.png")}
				style={{ position: "absolute", left: -6, top: -6, width: 78, height: 78 }}
				resizeMode="contain"
			/>
			<Box x={64} y={10} w={158} h={42} bg={p.cardBg} border={p.cardBorder} radius={12}>
				<Bar x={10} y={11} w={120} color={p.cardText} opacity={0.7} />
				<Bar x={10} y={24} w={82} color={p.cardText} opacity={0.7} />
			</Box>
			<Bar x={8} y={72} w={96} h={8} color={p.accent} />
			<Bar x={8} y={92} w={206} color={line} />
			<Bar x={8} y={106} w={52} color={line} />
			<Bar x={64} y={106} w={44} color={on ? p.emphasis : line} h={on ? 6 : 5} />
			<Bar x={112} y={106} w={102} color={line} />
			<Bar x={8} y={120} w={74} color={on ? p.emphasis : line} h={on ? 6 : 5} />
			<Bar x={86} y={120} w={128} color={line} />
			<Bar x={8} y={134} w={150} color={line} />
		</Canvas>
	);
}

/** Teoria 2 — as abas do editor de código: HTML, CSS e a aba Web com o resultado. */
export function TheoryTabsScene({ palette: p }: SceneProps) {
	const frame = useFrame([1000, 1400, 1400, 1800]);
	const tab = frame <= 0 ? 0 : frame === 1 ? 1 : 2;
	const tabs = ["HTML", "CSS", "Web"];
	const finger = [{ x: 36, y: 15 }, { x: 96, y: 15 }, { x: 156, y: 15 }, { x: 156, y: 15 }][frame];
	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={146} bg={p.codeArea} border={p.border} radius={10} />
			{tabs.map((name, i) => (
				<Box key={name} x={4 + i * 60} y={2} w={60} h={26} bg={tab === i ? p.accent : p.tabIdle} radius={i === 0 ? 10 : 0}>
					<Label x={name === "HTML" ? 16 : name === "CSS" ? 20 : 21} y={6} color={tab === i ? "#FFFFFF" : p.icon} size={11} bold>
						{name}
					</Label>
				</Box>
			))}
			{tab === 0 ? (
				<>
					<Mono x={14} y={42} color={TAG}>{"<h1 "}<Span color={ATTR}>class</Span></Mono>
					<Mono x={14} y={62} color={p.codeText}>{"  Olá!"}</Mono>
					<Mono x={14} y={82} color={TAG}>{"</h1>"}</Mono>
				</>
			) : null}
			{tab === 1 ? (
				<>
					<Mono x={14} y={42} color={ATTR}>{"h1 {"}</Mono>
					<Mono x={14} y={62} color={p.codeText}>{"  color: "}<Span color={STR}>red</Span></Mono>
					<Mono x={14} y={82} color={ATTR}>{"}"}</Mono>
				</>
			) : null}
			{tab === 2 ? (
				<Box x={14} y={38} w={202} h={100} bg="#FFFFFF" radius={6}>
					<Label x={14} y={16} color="#D63D3D" size={22} bold>
						Olá!
					</Label>
					<Bar x={14} y={60} w={150} color="#C9CED8" />
					<Bar x={14} y={74} w={104} color="#C9CED8" />
				</Box>
			) : null}
			<Finger at={finger} tapKey={tapOn(frame, [1, 2])} color={p.emphasis} />
		</Canvas>
	);
}

/** Teoria 3 — o botão Executar do terminal e a saída que aparece. */
export function TheoryRunScene({ palette: p }: SceneProps) {
	const { t } = useTranslation();
	const frame = useFrame([1000, 800, 2200]);
	const finger = [{ x: 150, y: 124 }, { x: 40, y: 116 }, { x: 40, y: 116 }][frame];
	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={86} bg={p.codeArea} border={p.border} radius={10}>
				<Mono x={10} y={14} color={TAG}>{"let "}<Span color={p.codeText}>x = 2 + 3;</Span></Mono>
				<Mono x={10} y={36} color={p.codeText}>{"console.log(x);"}</Mono>
			</Box>
			<Box x={4} y={88} w={222} h={60} bg={p.terminalBg} border={p.border} radius={10}>
				<Box x={8} y={8} w={72} h={24} bg={p.accent} radius={12} opacity={frame === 1 ? 0.7 : 1}>
					<Label x={11} y={5} color="#FFFFFF" size={11} bold>
						{`▶ ${t("codeSection.run")}`}
					</Label>
				</Box>
				{frame === 2 ? <Mono x={10} y={38} color={p.codeText}>{"> 5"}</Mono> : null}
			</Box>
			<Finger at={finger} tapKey={tapOn(frame, [1])} color={p.emphasis} />
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Avançar / conferir (comum a várias atividades)
// ---------------------------------------------------------------------------

/**
 * O botão "Seguinte" fixo no rodapé e a barra de progresso que avança. Com
 * `verdict`, depois do toque aparece o cartão que diz se acertou.
 */
export function ProceedScene({ palette: p, verdict = false }: SceneProps & { verdict?: boolean }) {
	const { t } = useTranslation();
	const frame = useFrame([1000, 700, 2000]);
	const done = frame === 2;
	return (
		<Canvas palette={p}>
			<Box x={4} y={6} w={222} h={6} bg={p.border} radius={3}>
				<Box x={0} y={0} w={done && !verdict ? 150 : 100} h={6} bg={p.accent} radius={3} />
			</Box>
			<Label x={4} y={18} color={p.icon} size={10}>
				{t("theory.progress", { current: done && !verdict ? 3 : 2, total: 5 })}
			</Label>
			<Bar x={8} y={44} w={150} color={dim(p)} />
			<Bar x={8} y={58} w={204} color={dim(p)} />
			<Bar x={8} y={72} w={120} color={dim(p)} />
			<Box x={4} y={106} w={222} h={38} bg={p.accent} radius={14} opacity={frame === 1 ? 0.7 : 1}>
				<Label x={78} y={11} color="#FFFFFF" size={14} bold>
					{`${t("next")}  →`}
				</Label>
			</Box>
			{verdict && done ? (
				<Box x={10} y={30} w={210} h={66} bg={p.screen} border={p.success} radius={14} borderWidth={2}>
					<Icon type="ionicon" name="checkmark-circle" size={26} color={p.success} style={{ position: "absolute", left: 12, top: 12 }} />
					<Label x={46} y={15} w={156} color={p.text} size={12} bold>
						{t("congrats")}
					</Label>
					<Bar x={46} y={38} w={100} color={dim(p)} />
					<Bar x={46} y={50} w={70} color={dim(p)} />
				</Box>
			) : null}
			<Finger at={frame === 0 ? { x: 190, y: 70 } : { x: 120, y: 125 }} tapKey={tapOn(frame, [1])} color={p.emphasis} />
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Múltipla escolha
// ---------------------------------------------------------------------------

/** Ler o enunciado e o trecho de código (ou, no desafio, a lista de requisitos). */
export function ReadScene({ palette: p, requirements = false }: SceneProps & { requirements?: boolean }) {
	const { t } = useTranslation();
	const frame = useFrame([800, 800, 800, 800, 1400]);
	const line = dim(p);

	if (requirements) {
		const rows = [46, 76, 106];
		return (
			<Canvas palette={p}>
				<Box x={4} y={6} w={140} h={22} bg={p.goldBg} border={p.gold} radius={11}>
					<Label x={10} y={4} color={p.goldInk} size={11} bold>
						{`🏆 ${t("tutorial.demo.challenge")}`}
					</Label>
				</Box>
				{rows.map((y, i) => {
					const active = frame === i;
					return (
						<Box key={y} x={4} y={y} w={222} h={26} bg={active ? p.cardBg : p.gradientTo} border={active ? p.accent : p.border} radius={10} borderWidth={2}>
							<Box x={9} y={6} w={10} h={10} bg={active ? p.accent : undefined} border={active ? p.accent : p.icon} radius={5} borderWidth={2} />
							<Bar x={28} y={10} w={[110, 150, 90][i]} color={active ? p.text : line} />
						</Box>
					);
				})}
			</Canvas>
		);
	}

	return (
		<Canvas palette={p}>
			<Bar x={6} y={8} w={190} h={7} color={p.text} opacity={0.7} />
			<Bar x={6} y={22} w={120} h={7} color={p.text} opacity={0.7} />
			<Box x={4} y={40} w={222} h={104} bg={p.codeArea} border={p.border} radius={10}>
				{frame < 4 ? <Box x={4} y={8 + frame * 22} w={212} h={20} bg={p.accent} opacity={0.28} radius={6} /> : null}
				<Mono x={12} y={12} color={TAG}>{"let "}<Span color={p.codeText}>n = 3;</Span></Mono>
				<Mono x={12} y={34} color={p.codeText}>{"n = n * 2;"}</Mono>
				<Mono x={12} y={56} color={p.codeText}>{"n = n + 1;"}</Mono>
				<Mono x={12} y={78} color={p.codeText}>{"console.log(n);"}</Mono>
			</Box>
		</Canvas>
	);
}

/** Escolher uma alternativa e poder trocar de ideia. */
export function OptionsScene({ palette: p }: SceneProps) {
	const frame = useFrame([1000, 1100, 1900]);
	const selected = frame === 0 ? -1 : frame === 1 ? 1 : 2;
	const ys = [38, 72, 106];
	const finger = [{ x: 200, y: 20 }, { x: 150, y: 89 }, { x: 150, y: 123 }][frame];
	return (
		<Canvas palette={p}>
			<Bar x={6} y={8} w={180} h={7} color={p.text} opacity={0.7} />
			<Bar x={6} y={21} w={110} h={7} color={p.text} opacity={0.7} />
			{ys.map((y, i) => {
				const on = selected === i;
				return (
					<Box key={y} x={4} y={y} w={222} h={30} bg={on ? p.cardBg : p.gradientTo} border={on ? p.accent : p.border} radius={12} borderWidth={2}>
						<Box x={10} y={7} w={14} h={14} border={on ? p.accent : p.icon} radius={7} borderWidth={2}>
							{on ? <Box x={2} y={2} w={6} h={6} bg={p.accent} radius={3} borderWidth={0} /> : null}
						</Box>
						<Bar x={34} y={12} w={[90, 130, 70][i]} color={on ? p.text : dim(p)} />
					</Box>
				);
			})}
			<Finger at={finger} tapKey={tapOn(frame, [1, 2])} color={p.emphasis} />
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Completar código por blocos (code_blank e playground)
// ---------------------------------------------------------------------------

const CHIP_Y = 94;
const CHIPS = [
	{ x: 4, label: '"Ana"' },
	{ x: 80, label: "nome" },
	{ x: 156, label: "10" }
];

/** Slots (lacunas) da cena: onde cada um fica dentro do cartão de código. */
const SLOTS = [
	{ x: 86, y: 9 },
	{ x: 92, y: 33 }
];

type BlankMode = "see" | "fill" | "undo";

/**
 * Completar código tocando em blocos. `see`: as lacunas piscam; `fill`: o dedo leva um
 * bloco a cada lacuna; `undo`: tocar numa lacuna preenchida devolve o bloco.
 */
export function BlankScene({ palette: p, mode }: SceneProps & { mode: BlankMode }) {
	const frames = { see: [800, 800, 800, 1600], fill: [900, 1000, 1000, 2000], undo: [1200, 1100, 1100, 2000] }[mode];
	const frame = useFrame(frames);

	// filled[k] = índice do bloco que está na lacuna k (ou -1).
	let filled: number[];
	let finger: { x: number; y: number } | null = null;
	let taps: number[] = [];
	if (mode === "see") {
		filled = [-1, -1];
	} else if (mode === "fill") {
		filled = [[-1, -1], [0, -1], [0, 1], [0, 1]][frame];
		finger = [{ x: 190, y: 130 }, { x: 36, y: CHIP_Y + 20 }, { x: 112, y: CHIP_Y + 20 }, { x: 112, y: CHIP_Y + 20 }][frame];
		taps = [1, 2];
	} else {
		filled = [[0, 1], [0, -1], [0, 1], [0, 1]][frame];
		finger = [{ x: 190, y: 130 }, { x: SLOTS[1].x + 20, y: SLOTS[1].y + 10 }, { x: 112, y: CHIP_Y + 20 }, { x: 112, y: CHIP_Y + 20 }][frame];
		taps = [1, 2];
	}
	const pulse = mode === "see" && frame % 2 === 0;
	const used = (chip: number) => filled.includes(chip);

	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={66} bg={p.codeArea} border={p.border} radius={10} />
			<Mono x={12} y={11} color={TAG}>{"let "}<Span color={p.codeText}>nome = </Span></Mono>
			<Mono x={12} y={35} color={p.codeText}>{"console.log("}</Mono>
			<Mono x={SLOTS[0].x + 50} y={11} color={p.codeText}>{";"}</Mono>
			<Mono x={SLOTS[1].x + 50} y={35} color={p.codeText}>{");"}</Mono>
			{SLOTS.map((slot, k) => {
				const chip = filled[k];
				return (
					<Box
						key={k}
						x={slot.x}
						y={slot.y}
						w={46}
						h={20}
						bg={chip >= 0 ? p.cardBg : undefined}
						border={chip >= 0 ? p.accent : pulse ? p.accent : p.icon}
						borderWidth={pulse ? 2 : 1}
						radius={6}
						style={chip >= 0 ? undefined : { borderStyle: "dashed" }}
					>
						{chip >= 0 ? (
							<Mono x={5} y={2} color={p.emphasis} size={10}>
								{CHIPS[chip].label}
							</Mono>
						) : (
							<Mono x={13} y={2} color={p.icon} size={10}>
								___
							</Mono>
						)}
					</Box>
				);
			})}
			{CHIPS.map((chip, i) => (
				<Box key={chip.label} x={chip.x} y={CHIP_Y} w={70} h={28} bg={p.gradientTo} border={p.border} radius={10} borderWidth={2} opacity={used(i) ? 0.3 : 1}>
					<Mono x={12} y={5} color={p.text} size={11}>
						{chip.label}
					</Mono>
				</Box>
			))}
			<Finger at={finger} tapKey={tapOn(frame, taps)} color={p.emphasis} />
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Completar código digitando (fill_blank)
// ---------------------------------------------------------------------------

const ANSWER = "const";

/** A lacuna de uma palavra e o campo de texto onde a resposta é digitada. */
export function FillBlankScene({ palette: p, stage }: SceneProps & { stage: "see" | "type" }) {
	const frame = useFrame(stage === "see" ? [800, 800, 800, 1400] : [700, 260, 260, 260, 260, 260, 800, 1800]);
	const typed = stage === "see" ? "" : ANSWER.slice(0, Math.min(frame, ANSWER.length));
	const entered = stage === "type" && frame >= 6;
	const pulse = stage === "see" && frame % 2 === 0;
	const keys = [0, 1, 2, 3, 4, 5, 6];
	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={56} bg={p.codeArea} border={p.border} radius={10} />
			<Box
				x={12}
				y={9}
				w={50}
				h={20}
				bg={entered ? p.successBg : typed ? p.cardBg : undefined}
				border={entered ? p.success : pulse || typed ? p.accent : p.icon}
				borderWidth={pulse ? 2 : 1}
				radius={6}
				style={typed || entered ? undefined : { borderStyle: "dashed" }}
			>
				{typed ? (
					<Mono x={5} y={2} color={entered ? p.success : p.emphasis} size={11}>
						{typed}
					</Mono>
				) : (
					<Mono x={16} y={2} color={p.icon} size={10}>
						___
					</Mono>
				)}
			</Box>
			<Mono x={68} y={11} color={p.codeText}>{"idade = 20;"}</Mono>
			<Mono x={12} y={33} color={p.codeText}>{"console.log(idade);"}</Mono>
			{stage === "type" ? (
				<>
					<Box x={4} y={66} w={222} h={32} bg={p.gradientTo} border={p.accent} radius={10} borderWidth={2}>
						<Mono x={10} y={7} color={p.text} size={12}>
							{typed}
							<Span color={p.accent}>{entered ? "" : "|"}</Span>
						</Mono>
					</Box>
					{[0, 1].map((row) =>
						keys.map((k) => (
							<Box key={`${row}-${k}`} x={8 + k * 24} y={108 + row * 20} w={21} h={16} bg={p.border} radius={4} />
						))
					)}
					<Box x={180} y={128} w={42} h={16} bg={entered ? p.accent : p.border} radius={4} />
					<Finger at={entered ? { x: 201, y: 136 } : null} tapKey={tapOn(frame, [6])} color={p.emphasis} />
				</>
			) : (
				<>
					<Box x={4} y={72} w={222} h={34} bg={p.gradientTo} border={p.border} radius={10} borderWidth={2}>
						<Label x={12} y={10} color={p.icon} size={11}>
							_ _ _ _ _
						</Label>
					</Box>
					<Bar x={6} y={122} w={150} color={dim(p)} />
					<Bar x={6} y={134} w={100} color={dim(p)} />
				</>
			)}
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Montar o código (reorder)
// ---------------------------------------------------------------------------

const LINES = ["console.log(x);", "const x = 5;", "x = x + 1;"];
// Ordem certa, como índices do banco embaralhado.
const CORRECT = [1, 2, 0];
const ROW_Y = [6, 30, 54];
const BANK_Y = [90, 110, 130];

type ReorderMode = "see" | "place" | "undo";

/** Linhas embaralhadas que o dedo põe na ordem; tocar numa linha posta a devolve. */
export function ReorderScene({ palette: p, mode }: SceneProps & { mode: ReorderMode }) {
	const frame = useFrame(
		{ see: [800, 800, 800, 1600], place: [900, 1000, 1000, 1000, 2000], undo: [1200, 1100, 1100, 2000] }[mode]
	);

	let placed: number[];
	let finger: { x: number; y: number } | null = null;
	let taps: number[] = [];
	if (mode === "see") {
		placed = [];
	} else if (mode === "place") {
		placed = [[], [1], [1, 2], [1, 2, 0], [1, 2, 0]][frame];
		finger = [{ x: 190, y: 160 }, { x: 150, y: BANK_Y[1] + 14 }, { x: 150, y: BANK_Y[2] + 14 }, { x: 150, y: BANK_Y[0] + 14 }, { x: 150, y: BANK_Y[0] + 14 }][frame];
		taps = [1, 2, 3];
	} else {
		placed = [[1, 0, 2], [1, 2], [1, 2, 0], [1, 2, 0]][frame];
		finger = [{ x: 190, y: 160 }, { x: 150, y: ROW_Y[1] + 10 }, { x: 150, y: BANK_Y[0] + 14 }, { x: 150, y: BANK_Y[0] + 14 }][frame];
		taps = [1, 2];
	}
	const complete = placed.length === 3 && placed.every((bank, i) => bank === CORRECT[i]);
	const pulse = mode === "see" && frame % 2 === 0;

	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={80} bg={p.codeArea} border={complete ? p.success : p.border} radius={10} borderWidth={complete ? 2 : 1} />
			{ROW_Y.map((y, i) => (
				<Box key={y} x={9} y={y + 1} w={212} h={20} radius={6} border={placed[i] === undefined ? p.border : undefined} style={placed[i] === undefined ? { borderStyle: "dashed" } : undefined}>
					<Label x={5} y={4} color={p.icon} size={10}>
						{String(i + 1)}
					</Label>
					{placed[i] !== undefined ? (
						<Mono x={22} y={3} color={complete ? p.success : p.codeText} size={11}>
							{LINES[placed[i]]}
						</Mono>
					) : null}
				</Box>
			))}
			{LINES.map((line, i) => (
				<Box
					key={line}
					x={4}
					y={BANK_Y[i]}
					w={222}
					h={18}
					bg={p.gradientTo}
					border={pulse ? p.accent : p.border}
					radius={8}
					borderWidth={2}
					opacity={placed.includes(i) ? 0.3 : 1}
				>
					<Mono x={10} y={1} color={p.text} size={10.5}>
						{line}
					</Mono>
				</Box>
			))}
			<Finger at={finger} tapKey={tapOn(frame, taps)} color={p.emphasis} />
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Ligar pares (matching)
// ---------------------------------------------------------------------------

type MatchMode = "see" | "pair" | "wrong";
type Tone = "idle" | "selected" | "right" | "wrong";

const LEFT_Y = [8, 50, 92];
const ITEM_H = 32;

/** Dois lados com pares certos: um toque em cada lado, acerto verde, erro vermelho. */
export function MatchScene({ palette: p, mode }: SceneProps & { mode: MatchMode }) {
	const { t } = useTranslation();
	const frame = useFrame(
		{ see: [800, 800, 800, 1600], pair: [900, 800, 800, 800, 800, 2000], wrong: [900, 800, 800, 800, 800, 800, 2000] }[mode]
	);
	// Direita embaralhada: Link, Título, Parágrafo.
	const rightLabels = [t("tutorial.demo.link"), t("tutorial.demo.heading"), t("tutorial.demo.paragraph")];
	const leftLabels = ["<h1>", "<p>", "<a>"];
	// Direita r certa para a esquerda l.
	const partner = [1, 2, 0];

	let left: Tone[] = ["idle", "idle", "idle"];
	let right: Tone[] = ["idle", "idle", "idle"];
	let finger: { x: number; y: number } | null = null;
	let taps: number[] = [];
	const L = (i: number) => ({ x: 56, y: LEFT_Y[i] + ITEM_H - 8 });
	const R = (i: number) => ({ x: 174, y: LEFT_Y[i] + ITEM_H - 8 });

	if (mode === "see") {
		if (frame % 2 === 0) {
			left = ["selected", "selected", "selected"];
		} else {
			right = ["selected", "selected", "selected"];
		}
	} else if (mode === "pair") {
		if (frame >= 1) left[0] = "selected";
		if (frame >= 2) { left[0] = "right"; right[1] = "right"; }
		if (frame >= 3) left[1] = "selected";
		if (frame >= 4) { left[1] = "right"; right[2] = "right"; }
		finger = [{ x: 115, y: 140 }, L(0), R(1), L(1), R(2), R(2)][frame];
		taps = [1, 2, 3, 4];
	} else {
		left[0] = "right"; right[1] = "right";
		if (frame >= 1 && frame < 3) left[1] = "selected";
		if (frame === 2) right[0] = "wrong";
		if (frame === 2) left[1] = "wrong";
		if (frame >= 4) left[1] = "selected";
		if (frame >= 5) { left[1] = "right"; right[2] = "right"; }
		finger = [{ x: 115, y: 140 }, L(1), R(0), R(0), L(1), R(2), R(2)][frame];
		taps = [1, 2, 4, 5];
	}

	const style = (tone: Tone) =>
		({
			idle: { bg: p.gradientTo, border: p.border },
			selected: { bg: p.cardBg, border: p.accent },
			right: { bg: p.successBg, border: p.success },
			wrong: { bg: p.dangerBg, border: p.danger }
		})[tone];

	return (
		<Canvas palette={p}>
			{[0, 1, 2].map((i) => {
				const l = style(left[i]);
				const r = style(right[i]);
				return (
					<Fragment key={i}>
						<Box x={4} y={LEFT_Y[i]} w={104} h={ITEM_H} bg={l.bg} border={l.border} radius={10} borderWidth={2}>
							<Mono x={left[i] === "right" ? 28 : 12} y={8} color={p.text} size={12}>
								{leftLabels[i]}
							</Mono>
							{left[i] === "right" ? <Icon type="ionicon" name="checkmark-circle" size={15} color={p.success} style={{ position: "absolute", left: 8, top: 7 }} /> : null}
						</Box>
						<Box x={122} y={LEFT_Y[i]} w={104} h={ITEM_H} bg={r.bg} border={r.border} radius={10} borderWidth={2}>
							<Label x={right[i] === "right" ? 28 : 12} y={9} color={p.text} size={12}>
								{rightLabels[i]}
							</Label>
							{right[i] === "right" ? <Icon type="ionicon" name="checkmark-circle" size={15} color={p.success} style={{ position: "absolute", left: 8, top: 7 }} /> : null}
						</Box>
					</Fragment>
				);
			})}
			<Finger at={finger} tapKey={tapOn(frame, taps)} color={p.emphasis} />
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Executar e conferir (playground e desafio)
// ---------------------------------------------------------------------------

/** Playground: Executar, a prévia com o console e o veredito (errou, ajustou, funcionou). */
export function PreviewResultScene({ palette: p, verdict }: SceneProps & { verdict: boolean }) {
	const { t } = useTranslation();
	// Sem veredito: idle, toque, resultado. Com veredito: idle, toque, errou, toque, acertou.
	const frame = useFrame(verdict ? [800, 600, 1500, 700, 2200] : [1000, 800, 2200]);
	const ran = frame >= 2;
	const wrong = verdict && frame === 2;
	const right = verdict ? frame === 4 : false;
	const tapFrames = verdict ? [1, 3] : [1];
	const fingerAt = { x: 40, y: 134 };
	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={54} bg="#FFFFFF" border={p.border} radius={10}>
				{ran ? (
					<>
						<Label x={12} y={10} color={right ? "#2A9D4B" : verdict ? "#D63D3D" : "#222"} size={20} bold>
							Olá!
						</Label>
						<Bar x={12} y={38} w={90} color="#C9CED8" />
					</>
				) : (
					<Label x={12} y={20} color="#9AA3B2" size={11}>
						{t("tutorial.demo.preview")}
					</Label>
				)}
			</Box>
			<Box x={4} y={60} w={222} h={36} bg={p.terminalBg} border={p.border} radius={10}>
				{ran ? <Mono x={10} y={10} color={p.codeText}>{"> Olá!"}</Mono> : null}
			</Box>
			<Box x={4} y={108} w={72} h={30} bg={p.accent} radius={15} opacity={frame === 1 || (verdict && frame === 3) ? 0.7 : 1}>
				<Label x={11} y={8} color="#FFFFFF" size={11} bold>
					{`▶ ${t("codeSection.run")}`}
				</Label>
			</Box>
			{verdict && (wrong || right) ? (
				<Box x={86} y={108} w={140} h={30} bg={right ? p.successBg : undefined} border={right ? p.success : p.warning} radius={10} borderWidth={2}>
					<Label x={12} y={8} color={right ? p.success : p.warning} size={11} bold>
						{right ? `✓ ${t("tutorial.demo.worked")}` : t("tutorial.demo.notYet")}
					</Label>
				</Box>
			) : null}
			<Finger at={fingerAt} tapKey={tapOn(frame, tapFrames)} color={p.emphasis} />
		</Canvas>
	);
}

/** Desafio: a aba Resultado com a lista de requisitos marcada com ✓ e ✗. */
export function ChecksScene({ palette: p }: SceneProps) {
	const { t } = useTranslation();
	const frame = useFrame([1000, 700, 1800, 800, 2400]);
	const onResult = frame >= 2;
	const allOk = frame === 4;
	const rows = [{ w: 120, ok: true }, { w: 150, ok: true }, { w: 96, ok: allOk }];
	const finger = { x: 40, y: 140 };
	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={104} bg={p.codeArea} border={p.border} radius={10} />
			{[t("tutorial.demo.code"), t("tutorial.demo.result")].map((name, i) => {
				const active = (i === 1) === onResult;
				return (
					<Box key={name} x={4 + i * 70} y={2} w={70} h={24} bg={active ? p.accent : p.tabIdle} radius={i === 0 ? 10 : 0}>
						<Label x={i === 0 ? 14 : 8} y={5} color={active ? "#FFFFFF" : p.icon} size={11} bold>
							{name}
						</Label>
					</Box>
				);
			})}
			{onResult ? (
				rows.map((row, i) => (
					<Box key={i} x={12} y={36 + i * 22} w={206} h={18}>
						<Icon type="ionicon" name={row.ok ? "checkmark-circle" : "close-circle"} size={16} color={row.ok ? p.success : p.danger} style={{ position: "absolute", left: 0, top: 0 }} />
						<Bar x={24} y={6} w={row.w} color={dim(p)} />
					</Box>
				))
			) : (
				<>
					<Mono x={14} y={38} color={TAG}>{"<form>"}</Mono>
					<Mono x={14} y={58} color={p.codeText}>{"  <input>"}</Mono>
					<Mono x={14} y={78} color={TAG}>{"</form>"}</Mono>
				</>
			)}
			<Box x={4} y={116} w={72} h={30} bg={p.accent} radius={15} opacity={frame === 1 || frame === 3 ? 0.7 : 1}>
				<Label x={11} y={8} color="#FFFFFF" size={11} bold>
					{`▶ ${t("codeSection.run")}`}
				</Label>
			</Box>
			{onResult ? (
				<Box x={86} y={116} w={140} h={30} bg={allOk ? p.successBg : undefined} border={allOk ? p.success : p.warning} radius={10} borderWidth={2}>
					<Label x={12} y={8} color={allOk ? p.success : p.warning} size={11} bold>
						{allOk ? `✓ ${t("tutorial.demo.worked")}` : t("tutorial.demo.notYet")}
					</Label>
				</Box>
			) : null}
			<Finger at={finger} tapKey={tapOn(frame, [1, 3])} color={p.emphasis} />
		</Canvas>
	);
}

// ---------------------------------------------------------------------------
// Desafio: editor e ajuda
// ---------------------------------------------------------------------------

const SYMBOLS = ["Tab", "<", ">", "/", "=", '"'];

/** O editor onde o código é digitado e a barra de símbolos acima do teclado. */
export function EditorScene({ palette: p }: SceneProps) {
	const { t } = useTranslation();
	const frame = useFrame([1000, 1100, 1100, 1100, 2200]);
	// Teclas centralizadas na barra: "Tab" é mais larga que os símbolos.
	const widths = SYMBOLS.map((symbol) => (symbol === "Tab" ? 42 : 30));
	const GAP = 5;
	const total = widths.reduce((sum, w) => sum + w, 0) + GAP * (SYMBOLS.length - 1);
	const left = 4 + (222 - total) / 2;
	const xs = widths.map((_, i) => left + widths.slice(0, i).reduce((sum, w) => sum + w + GAP, 0));
	const keyFor = [-1, 1, 4, 2, 2][frame];
	const fingerAt = frame === 0 ? { x: 120, y: 60 } : { x: xs[keyFor] + widths[keyFor] / 2 - 6, y: 135 };
	return (
		<Canvas palette={p}>
			<Box x={4} y={2} w={222} h={108} bg={p.codeArea} border={p.border} radius={10} />
			{[t("tutorial.demo.code"), t("tutorial.demo.result")].map((name, i) => (
				<Box key={name} x={4 + i * 70} y={2} w={70} h={24} bg={i === 0 ? p.accent : p.tabIdle} radius={i === 0 ? 10 : 0}>
					<Label x={i === 0 ? 14 : 8} y={5} color={i === 0 ? "#FFFFFF" : p.icon} size={11} bold>
						{name}
					</Label>
				</Box>
			))}
			{frame >= 1 ? <Mono x={12} y={34} color={TAG}>{"<form>"}</Mono> : null}
			{frame >= 2 ? <Mono x={12} y={53} color={p.codeText}>{"  <input required>"}</Mono> : null}
			{frame >= 3 ? <Mono x={12} y={72} color={TAG}>{"</form>"}</Mono> : null}
			{frame < 4 ? <Box x={frame === 0 ? 12 : 12 + (frame === 1 ? 6.6 * 6 : frame === 2 ? 6.6 * 18 : 6.6 * 7)} y={frame === 0 ? 34 : 34 + (frame - 1) * 19} w={2} h={13} bg={p.accent} /> : null}
			<Box x={4} y={118} w={222} h={30} bg={p.border} radius={8} />
			{SYMBOLS.map((symbol, i) => (
				<Box key={symbol} x={xs[i]} y={122} w={widths[i]} h={22} bg={keyFor === i ? p.accent : p.gradientTo} radius={6}>
					<Mono x={symbol === "Tab" ? 10 : 11} y={symbol === "Tab" ? 4 : 3} color={keyFor === i ? "#FFFFFF" : p.text} size={symbol === "Tab" ? 10 : 12} bold>
						{symbol}
					</Mono>
				</Box>
			))}
			<Finger at={fingerAt} tapKey={tapOn(frame, [1, 2, 3])} color={p.emphasis} />
		</Canvas>
	);
}

/** Dicas e solução que abrem com o tempo, as tentativas ou a Dica Instantânea. */
export function HintsScene({ palette: p }: SceneProps) {
	const { t } = useTranslation();
	const frame = useFrame([1200, 1200, 1400, 1300, 2400]);
	// Quantas ajudas estão abertas em cada quadro.
	const open = [0, 0, 1, 2, 2][frame];
	const attempts = [0, 1, 2, 2, 2][frame];
	const timer = [0, 0.45, 1, 0, 0][frame];
	const rows = [{ y: 4, label: t("tutorial.demo.hint", { n: 1 }) }, { y: 38, label: t("tutorial.demo.hint", { n: 2 }) }, { y: 72, label: t("tutorial.demo.solution") }];
	return (
		<Canvas palette={p}>
			{rows.map((row, i) => {
				const unlocked = i < open;
				return (
					<Box key={row.y} x={4} y={row.y} w={222} h={30} bg={unlocked ? p.cardBg : p.gradientTo} border={unlocked ? p.accent : p.border} radius={10} borderWidth={2} style={unlocked ? undefined : { borderStyle: "dashed" }}>
						<Icon type="ionicon" name={unlocked ? "bulb" : "lock-closed"} size={16} color={unlocked ? p.emphasis : p.icon} style={{ position: "absolute", left: 10, top: 6 }} />
						<Label x={34} y={8} color={unlocked ? p.text : p.icon} size={12} bold={unlocked}>
							{row.label}
						</Label>
					</Box>
				);
			})}
			<Label x={6} y={112} color={p.icon} size={10}>
				{t("tutorial.demo.attempts", { n: attempts })}
			</Label>
			<Box x={104} y={115} w={120} h={6} bg={p.border} radius={3}>
				<Box x={0} y={0} w={120 * timer} h={6} bg={p.accent} radius={3} />
			</Box>
			<Box x={4} y={124} w={150} h={24} bg={p.cardBg} border={p.gold} radius={12} opacity={frame >= 3 ? 1 : 0.55}>
				<Label x={10} y={5} color={p.goldInk} size={11} bold>
					{`⚡ ${t("tutorial.demo.instant")}`}
				</Label>
			</Box>
			<Finger at={frame >= 3 ? { x: 80, y: 136 } : null} tapKey={tapOn(frame, [3])} color={p.emphasis} />
		</Canvas>
	);
}
