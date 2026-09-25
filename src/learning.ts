import { stages } from './stages';
import { worldLessonsByStage } from './lessons/worldLessons';

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

export const learningUnitsByStage: Record<string, LearningUnit[]> = worldLessonsByStage;

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
