export type SM2Input = {
	readonly quality: number; // 0-5
	readonly repetitions: number;
	readonly easeFactor: number;
	readonly interval: number;
};

export type SM2Output = {
	readonly repetitions: number;
	readonly easeFactor: number;
	readonly interval: number;
};

export function sm2(input: SM2Input): SM2Output {
	const { quality, repetitions, easeFactor, interval } = input;

	if (quality < 3) {
		// Failed: reset repetitions and interval
		return {
			repetitions: 0,
			easeFactor,
			interval: 1,
		};
	}

	// Successful recall
	let newInterval: number;
	if (repetitions === 0) {
		newInterval = 1;
	} else if (repetitions === 1) {
		newInterval = 6;
	} else {
		newInterval = Math.round(interval * easeFactor);
	}

	const newEaseFactor = Math.max(
		1.3,
		easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
	);

	return {
		repetitions: repetitions + 1,
		easeFactor: newEaseFactor,
		interval: newInterval,
	};
}
