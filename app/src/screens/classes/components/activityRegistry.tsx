import type { ReactElement } from "react";
import type { DimensionValue } from "react-native";
import type {
	CodeBlankActivityContent,
	FillBlankActivityContent,
	MatchingActivityContent,
	OptionActivityContent,
	ReorderActivityContent,
	TheoryActivityContent,
} from "codap-api/src/types/contracts";
import TheoryView from "./TheoryLesson";
import OptionExercise from "./OptionExercise";
import CodeBlankExercise from "./CodeBlankExercise";
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
	theory: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as TheoryActivityContent;
		return (
			<TheoryView
				key={activityKey}
				firstParagraph={c.firstParagraph}
				secondParagraph={c.secondParagraph}
				thirdParagraph={c.thirdParagraph}
				endParagraph={c.endParagraph}
				highlight={c.highlight}
				codeLanguage={c.codeLanguage}
				code={c.code}
				additionalCode={c.additionalCode}
				onlyCode={c.onlyCode}
				noTerminal={c.noTerminal}
				terminalCode={c.terminalCode}
				tutorial={c.tutorial}
				progress={progress}
				onProceed={onProceed}
				onClose={onClose}
			/>
		);
	},
	option: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as OptionActivityContent;
		return (
			<OptionExercise
				key={activityKey}
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
	code_blank: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as CodeBlankActivityContent;
		return (
			<CodeBlankExercise
				key={activityKey}
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
	fill_blank: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as FillBlankActivityContent;
		return (
			<FillBlankExercise
				key={activityKey}
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
	reorder: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as ReorderActivityContent;
		return (
			<ReorderExercise
				key={activityKey}
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
	matching: ({ content, activityKey, progress, onProceed, onClose }) => {
		const c = content as MatchingActivityContent;
		return (
			<MatchingExercise
				key={activityKey}
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
