import type { ReactElement } from "react";
import type { DimensionValue } from "react-native";
import type {
	CodeBlankActivityContent,
	CodeEditorActivityContent,
	CodePlaygroundActivityContent,
	FillBlankActivityContent,
	MatchingActivityContent,
	OptionActivityContent,
	ReorderActivityContent,
} from "codap-api/src/types/contracts";
import TheoryView from "./TheoryLesson";
import { normalizeTheoryContent } from "../../../utils/theoryContent";
import OptionExercise from "./OptionExercise";
import CodeBlankExercise from "./CodeBlankExercise";
import CodePlaygroundExercise from "./CodePlaygroundExercise";
import CodeEditorExercise from "./CodeEditorExercise";
import FillBlankExercise from "./FillBlankExercise";
import ReorderExercise from "./ReorderExercise";
import MatchingExercise from "./MatchingExercise";

/** O que o `ActivityPlayer` entrega a cada tipo, além do `content`. */
export interface ActivityRenderArgs {
	content: unknown;
	/**
	 * Vai para o `key` do componente: sem ele, duas atividades seguidas do
	 * mesmo tipo reaproveitariam a mesma instância e herdariam o estado da
	 * anterior (alternativa marcada, blocos postos, modal aberto).
	 */
	activityKey: number;
	progress: DimensionValue;
	/** Posição desta atividade na sessão (1-based) e o tamanho da sessão. */
	step: number;
	total: number;
	/** Título da lição, quando quem monta a sessão o conhece. */
	title?: string;
	onProceed: () => void;
	onClose: () => void;
}

/**
 * Um renderizador por `type`. Tipo fora daqui é descartado antes de entrar no
 * player (`filterPlayable`) — por isso uma versão antiga do app só deixa de
 * mostrar um tipo novo, em vez de quebrar. Para estender, basta uma entrada.
 */
export const ACTIVITY_REGISTRY: Record<
	string,
	(args: ActivityRenderArgs) => ReactElement
> = {
	theory: ({ content, activityKey, progress, step, total, title, onProceed, onClose }) => {
		return (
			<TheoryView
				key={activityKey}
				content={normalizeTheoryContent(content)}
				title={title}
				step={step}
				total={total}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	option: ({ content, activityKey, progress, step, total, title, onProceed, onClose }) => {
		const c = content as OptionActivityContent;
		return (
			<OptionExercise
				key={activityKey}
				title={title}
				step={step}
				total={total}
				question={c.question}
				aditionalParagraph={c.aditionalParagraph}
				options={c.options}
				code={c.code}
				codeLanguage={c.codeLanguage}
				optionsAsCode={c.optionsAsCode}
				correctOption={c.correctOption}
				highlight={c.highlight}
				tutorial={c.tutorial}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	code_blank: ({ content, activityKey, progress, step, total, title, onProceed, onClose }) => {
		const c = content as CodeBlankActivityContent;
		return (
			<CodeBlankExercise
				key={activityKey}
				title={title}
				step={step}
				total={total}
				question={c.question}
				highlight={c.highlight}
				codeLanguage={c.codeLanguage}
				code={c.code}
				answers={c.answers}
				distractors={c.distractors}
				tutorial={c.tutorial}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	code_playground: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as CodePlaygroundActivityContent;
		return (
			<CodePlaygroundExercise
				key={activityKey}
				question={c.question}
				highlight={c.highlight}
				codeLanguage={c.codeLanguage}
				code={c.code}
				blocks={c.blocks}
				html={c.html}
				css={c.css}
				js={c.js}
				checkScript={c.checkScript}
				tutorial={c.tutorial}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	code_editor: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as CodeEditorActivityContent;
		return (
			<CodeEditorExercise
				key={activityKey}
				question={c.question}
				highlight={c.highlight}
				codeLanguage={c.codeLanguage}
				starterCode={c.starterCode}
				html={c.html}
				css={c.css}
				js={c.js}
				checkScript={c.checkScript}
				hints={c.hints}
				solution={c.solution}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	fill_blank: ({ content, activityKey, progress, step, total, title, onProceed, onClose }) => {
		const c = content as FillBlankActivityContent;
		return (
			<FillBlankExercise
				key={activityKey}
				title={title}
				step={step}
				total={total}
				question={c.question}
				highlight={c.highlight}
				codeLanguage={c.codeLanguage}
				code={c.code}
				answers={c.answers}
				ignoreCase={c.ignoreCase}
				tutorial={c.tutorial}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	reorder: ({ content, activityKey, progress, step, total, title, onProceed, onClose }) => {
		const c = content as ReorderActivityContent;
		return (
			<ReorderExercise
				key={activityKey}
				title={title}
				step={step}
				total={total}
				question={c.question}
				highlight={c.highlight}
				codeLanguage={c.codeLanguage}
				lines={c.lines}
				distractors={c.distractors ?? []}
				tutorial={c.tutorial}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	matching: ({ content, activityKey, progress, step, total, title, onProceed, onClose }) => {
		const c = content as MatchingActivityContent;
		return (
			<MatchingExercise
				key={activityKey}
				title={title}
				step={step}
				total={total}
				question={c.question}
				highlight={c.highlight}
				pairs={c.pairs}
				leftAsCode={c.leftAsCode}
				tutorial={c.tutorial}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
};
