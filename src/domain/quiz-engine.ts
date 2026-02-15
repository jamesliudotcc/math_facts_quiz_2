import type { Attempt } from "./attempt";
import { FORMAT_WEIGHT } from "./format-difficulty";

const BASE_INTERVAL_MS = 30_000; // 30 seconds
const MULTIPLIER = 3;
const FAILED_INTERVAL_MS = 10_000; // 10 seconds

export type FamilyStats = {
	readonly lastTriedTime: number;
	readonly effectiveSuccesses: number;
};

export function desiredInterval(effectiveSuccesses: number): number {
	if (effectiveSuccesses === 0) return FAILED_INTERVAL_MS;
	return BASE_INTERVAL_MS * MULTIPLIER ** (effectiveSuccesses - 1);
}

export function deriveFamilyStats(attempts: readonly Attempt[]): FamilyStats {
	if (attempts.length === 0) {
		return { lastTriedTime: 0, effectiveSuccesses: 0 };
	}

	const lastTriedTime = attempts[attempts.length - 1].timestamp;

	let effectiveSuccesses = 0;
	for (let i = attempts.length - 1; i >= 0; i--) {
		if (attempts[i].correct) {
			effectiveSuccesses += FORMAT_WEIGHT[attempts[i].format];
		} else {
			break;
		}
	}

	return { lastTriedTime, effectiveSuccesses };
}

export function familyScore(
	attempts: readonly Attempt[],
	nowMs: number,
): number {
	const stats = deriveFamilyStats(attempts);
	if (stats.lastTriedTime === 0) return Number.POSITIVE_INFINITY;
	const elapsed = nowMs - stats.lastTriedTime;
	return elapsed / desiredInterval(stats.effectiveSuccesses);
}

export function selectBatch(
	allFamilyIds: readonly string[],
	attempts: readonly Attempt[],
	batchSize: number,
	nowMs: number,
	random: () => number = Math.random,
): string[] {
	if (allFamilyIds.length === 0) return [];

	const attemptsByFamily = new Map<string, Attempt[]>();
	for (const a of attempts) {
		const arr = attemptsByFamily.get(a.familyId);
		if (arr) {
			arr.push(a);
		} else {
			attemptsByFamily.set(a.familyId, [a]);
		}
	}

	const scored = allFamilyIds.map((id) => ({
		id,
		score: familyScore(attemptsByFamily.get(id) ?? [], nowMs),
	}));

	// Shuffle before sorting so tied scores get random order
	for (let i = scored.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[scored[i], scored[j]] = [scored[j], scored[i]];
	}

	scored.sort((a, b) => b.score - a.score);

	return scored.slice(0, batchSize).map((s) => s.id);
}
