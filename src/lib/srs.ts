/**
 * SM-2 Spaced Repetition Algorithm
 * Implements the SuperMemo 2 algorithm for flashcard scheduling.
 */

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSCard {
  difficulty: number;   // EF (easiness factor), min 1.3
  interval: number;     // days until next review
  repetitions: number;  // successful review count
  next_review: string;  // ISO timestamp
}

export interface SRSResult {
  difficulty: number;
  interval: number;
  repetitions: number;
  next_review: string;
}

/**
 * Calculate next review schedule based on SM-2 algorithm.
 * @param card - Current card state
 * @param quality - User's self-assessed quality (0-5)
 *   5 = Perfect response
 *   4 = Correct after hesitation
 *   3 = Correct with difficulty
 *   2 = Incorrect, but easy recall
 *   1 = Incorrect, remembered
 *   0 = Complete blackout
 */
export function calculateSRS(card: SRSCard, quality: ReviewQuality): SRSResult {
  let { difficulty, interval, repetitions } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * difficulty);
    }
    repetitions += 1;
  } else {
    // Incorrect response — reset
    repetitions = 0;
    interval = 1;
  }

  // Update easiness factor (EF)
  difficulty = difficulty + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (difficulty < 1.3) difficulty = 1.3;

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    difficulty: Math.round(difficulty * 100) / 100,
    interval,
    repetitions,
    next_review: nextReview.toISOString(),
  };
}

/**
 * Quality labels for the UI
 */
export const qualityLabels: Record<ReviewQuality, { label: string; color: string; emoji: string }> = {
  0: { label: "Không nhớ", color: "bg-red-500", emoji: "😵" },
  1: { label: "Rất khó", color: "bg-red-400", emoji: "😰" },
  2: { label: "Khó", color: "bg-orange-400", emoji: "😟" },
  3: { label: "Ổn", color: "bg-yellow-400", emoji: "🤔" },
  4: { label: "Tốt", color: "bg-emerald-400", emoji: "😊" },
  5: { label: "Xuất sắc", color: "bg-green-500", emoji: "🎉" },
};
