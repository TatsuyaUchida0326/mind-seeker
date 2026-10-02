// 旧36街版の保存キーと教材IDの決まり。旧版と、新版への進捗の引き継ぎで共有する。
// 引き継ぎ側が旧教材の本文を読み込まずに済むよう、キーとIDの組み立てだけをここに置く。
export const legacyProgressStorageKey = 'mind-seeker-learning-progress-v1';

const legacyLessonParts = ['foundation', 'practice', 'reflection'] as const;

export function legacyLessonIdsOf(stageId: string): string[] {
  return legacyLessonParts.map((part) => `${stageId}-${part}`);
}
