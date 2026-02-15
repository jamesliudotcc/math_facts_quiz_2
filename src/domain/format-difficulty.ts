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
	random: () => number = Math.random,
): QuizFormat {
	const weighted: { format: QuizFormat; weight: number }[] = [];

	for (const tier of FORMAT_TIERS) {
		for (const format of tier.formats) {
			if (!enabledFormats.has(format)) continue;
			const weight =
				effectiveSuccesses >= tier.minSuccesses
					? 1 + (effectiveSuccesses - tier.minSuccesses)
					: 0.1;
			weighted.push({ format, weight });
		}
	}

	if (weighted.length === 0) return [...enabledFormats][0];

	const total = weighted.reduce((sum, w) => sum + w.weight, 0);
	let roll = random() * total;
	for (const w of weighted) {
		roll -= w.weight;
		if (roll <= 0) return w.format;
	}
	return weighted[weighted.length - 1].format;
}
