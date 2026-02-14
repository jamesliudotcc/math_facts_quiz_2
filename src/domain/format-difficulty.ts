import { QuizFormat } from "./quiz-format";

export const FORMAT_WEIGHT: Record<QuizFormat, number> = {
	[QuizFormat.MUL]: 1,
	[QuizFormat.MUL_MISS]: 2,
	[QuizFormat.DIV]: 2,
	[QuizFormat.DIV_MISS_DIVISOR]: 3,
	[QuizFormat.DIV_MISS_DIVIDEND]: 3,
};

const FORMAT_TIERS: { minSuccesses: number; formats: QuizFormat[] }[] = [
	{
		minSuccesses: 6,
		formats: [QuizFormat.DIV_MISS_DIVISOR, QuizFormat.DIV_MISS_DIVIDEND],
	},
	{ minSuccesses: 4, formats: [QuizFormat.DIV] },
	{ minSuccesses: 2, formats: [QuizFormat.MUL_MISS] },
	{ minSuccesses: 0, formats: [QuizFormat.MUL] },
];

export function selectFormatForMastery(
	effectiveSuccesses: number,
	enabledFormats: ReadonlySet<QuizFormat>,
): QuizFormat {
	// Find the highest tier the student qualifies for
	for (const tier of FORMAT_TIERS) {
		if (effectiveSuccesses >= tier.minSuccesses) {
			const eligible = tier.formats.filter((f) => enabledFormats.has(f));
			if (eligible.length > 0) {
				return eligible[Math.floor(Math.random() * eligible.length)];
			}
		}
	}
	// Fallback: pick any enabled format
	return [...enabledFormats][0];
}
