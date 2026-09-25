import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import LessonPage from './LessonPage';
import Opening from './Opening';
import { completeLearningUnit, loadLearningProgress, progressStorageKey, type LearningProgress } from './learning';

function Root() {
  const [progress, setProgress] = useState<LearningProgress>(loadLearningProgress);
  const [stageWithGateOpening, setStageWithGateOpening] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  }, [progress]);

  const completeLesson = (stageId: string, lessonId: string) => {
    const result = completeLearningUnit(progress, stageId, lessonId);
    setProgress(result.progress);
    return result.stageCompleted;
  };

  return (
    <>
      <Routes>
        <Route path="/opening" element={<Opening onFinish={() => window.location.href = import.meta.env.BASE_URL} />} />
        <Route path="/" element={<App progress={progress} stageWithGateOpening={stageWithGateOpening} onShowGateOpening={setStageWithGateOpening} />} />
        <Route path="/lesson/:stageId" element={<LessonPage progress={progress} onCompleteLesson={completeLesson} onShowGateOpening={setStageWithGateOpening} />} />
      </Routes>
    </>
  );
}

export default Root;
