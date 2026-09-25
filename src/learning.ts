import { stages } from './stages';

export const progressStorageKey = 'mind-seeker-learning-progress-v1';

export interface LearningProgress {
  completedStageIds: string[];
  completedLessonIds: string[];
}

export interface LearningUnit {
  id: string;
  title: string;
  summary: string;
  body: string;
}

function createSampleLearningUnits(stageId: string, stageName: string): LearningUnit[] {
  return [
    {
      id: `${stageId}-foundation`,
      title: `${stageName}で学ぶこと`,
      summary: 'この街の学習テーマを知る',
      body: 'ここに、この街で身につける自己理解や行動の教材を追加します。この街専用の見出し・要約・本文に差し替えてください。',
    },
    {
      id: `${stageId}-practice`,
      title: '考え方を日常で試す',
      summary: '学んだことを小さな行動にする',
      body: 'ここにワーク、振り返りの問い、具体的な実践例などを追加します。教材は配列に順番に追加すると、次の教材が段階的に現れます。',
    },
    {
      id: `${stageId}-reflection`,
      title: '振り返りと次の一歩',
      summary: '学びを自分の言葉にする',
      body: 'ここに振り返り教材を追加します。街のすべての教材を完了すると修了証が発行され、次の街が解放されます。',
    },
  ];
}

// 実教材は街IDをキーにここへ追加する。未定義の街は差し替え用サンプルを表示する。
const learningUnitOverridesByStage: Partial<Record<string, LearningUnit[]>> = {};

export const learningUnitsByStage: Record<string, LearningUnit[]> = Object.fromEntries(
  stages.map(stage => [
    stage.id,
    learningUnitOverridesByStage[stage.id] ?? createSampleLearningUnits(stage.id, stage.name),
  ]),
);

export const initialLearningProgress: LearningProgress = { completedStageIds: [], completedLessonIds: [] };

export function getCompletedStageCount(progress: LearningProgress): number {
  const firstIncompleteIndex = stages.findIndex(stage => !progress.completedStageIds.includes(stage.id));
  return firstIncompleteIndex === -1 ? stages.length : firstIncompleteIndex;
}

export function getCompletedUnitCount(stageId: string, progress: LearningProgress): number {
  return (learningUnitsByStage[stageId] ?? []).filter(unit => progress.completedLessonIds.includes(unit.id)).length;
}

export function completeLearningUnit(progress: LearningProgress, stageId: string, lessonId: string) {
  const stageIndex = stages.findIndex(stage => stage.id === stageId);
  const completedStageCount = getCompletedStageCount(progress);
  if (stageIndex < 0 || stageIndex !== completedStageCount) return { progress, stageCompleted: false };

  const stageUnits = learningUnitsByStage[stageId];
  const nextUnit = stageUnits.find(unit => !progress.completedLessonIds.includes(unit.id));
  if (!nextUnit || nextUnit.id !== lessonId) return { progress, stageCompleted: false };

  const completedLessonIds = [...progress.completedLessonIds, lessonId];
  const stageCompleted = stageUnits.every(unit => completedLessonIds.includes(unit.id));
  return {
    progress: {
      completedLessonIds,
      completedStageIds: stageCompleted ? [...progress.completedStageIds, stageId] : progress.completedStageIds,
    },
    stageCompleted,
  };
}

export function loadLearningProgress(): LearningProgress {
  try {
    const storedProgress = localStorage.getItem(progressStorageKey);
    if (!storedProgress) return initialLearningProgress;
    const parsedProgress: unknown = JSON.parse(storedProgress);
    if (!parsedProgress || typeof parsedProgress !== 'object') return initialLearningProgress;

    const rawCompletedLessons = 'completedLessonIds' in parsedProgress && Array.isArray(parsedProgress.completedLessonIds)
      ? parsedProgress.completedLessonIds
      : [];
    const completedLessonSet = new Set(rawCompletedLessons.filter((id): id is string => typeof id === 'string'));
    const completedLessonIds: string[] = [];
    const completedStageIds: string[] = [];
    for (const stage of stages) {
      let stageCompleted = true;
      for (const unit of learningUnitsByStage[stage.id]) {
        if (!completedLessonSet.has(unit.id)) {
          stageCompleted = false;
          break;
        }
        completedLessonIds.push(unit.id);
      }
      if (!stageCompleted) break;
      completedStageIds.push(stage.id);
    }
    return { completedStageIds, completedLessonIds };
  } catch {
    return initialLearningProgress;
  }
}
