import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { stages } from './stages';
import { getCompletedStageCount, getCompletedUnitCount, learningUnitsByStage, type LearningProgress } from './learning';
import certificateImage from './assets/ui/certificate.png';

interface Props {
  progress: LearningProgress;
  onCompleteLesson: (stageId: string, lessonId: string) => boolean;
  onShowGateOpening: (stageId: string | null) => void;
}

function LessonPage({ progress, onCompleteLesson, onShowGateOpening }: Props) {
  const { stageId = '' } = useParams();
  const navigate = useNavigate();
  const selectedStage = stages.find(stage => stage.id === stageId);
  const stageName = selectedStage?.name ?? '';
  const stageIndex = stages.findIndex(stage => stage.id === stageId);
  const units = learningUnitsByStage[stageId] ?? [];
  const isCompleted = progress.completedStageIds.includes(stageId);
  const completedUnitCount = getCompletedUnitCount(stageId, progress);
  const [visibleUnitCount, setVisibleUnitCount] = useState(isCompleted ? units.length : Math.min(units.length, Math.max(1, completedUnitCount + 1)));
  const [showCertificate, setShowCertificate] = useState(false);
  const nextUnitRef = useRef<HTMLElement>(null);
  const certificateDialogRef = useRef<HTMLDialogElement>(null);
  const isAvailable = stageIndex >= 0 && stageIndex <= getCompletedStageCount(progress);
  const currentUnit = units[visibleUnitCount - 1];
  const currentUnitIsCompleted = currentUnit ? progress.completedLessonIds.includes(currentUnit.id) : false;
  const hasNextUnit = visibleUnitCount < units.length;
  const primaryActionLabel = currentUnitIsCompleted
    ? hasNextUnit ? '次の教材へ' : '地図へ戻る'
    : hasNextUnit ? 'この教材を完了して次へ' : '学習を完了して修了証を受け取る';
  const certificateActionLabel = stageIndex + 1 < stages.length
    ? '次の街の扉を開く'
    : '修了証を確認して地図へ戻る';

  useEffect(() => {
    nextUnitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [visibleUnitCount]);

  useEffect(() => {
    const certificateDialog = certificateDialogRef.current;
    if (showCertificate && certificateDialog && !certificateDialog.open) certificateDialog.showModal();
    if (!showCertificate && certificateDialog?.open) certificateDialog.close();
  }, [showCertificate]);

  if (!isAvailable || units.length === 0) {
    return (
      <main className="lesson-page">
        <p>この街はまだ解放されていません。</p>
        <button className="course-start" onClick={() => navigate('/')}>地図へ戻る</button>
      </main>
    );
  }

  const finishUnit = () => {
    const unitToComplete = currentUnit;
    if (!unitToComplete) return;
    const hasCompletedUnit = progress.completedLessonIds.includes(unitToComplete.id);
    if (!hasCompletedUnit) {
      const stageCompleted = onCompleteLesson(stageId, unitToComplete.id);
      if (stageCompleted) setShowCertificate(true);
      else setVisibleUnitCount(count => count + 1);
    } else if (hasNextUnit) {
      setVisibleUnitCount(count => count + 1);
    } else navigate('/');
  };

  const continueAfterCertificate = () => {
    setShowCertificate(false);
    const nextStage = stages[stageIndex + 1];
    if (!nextStage) { navigate('/'); return; }
    onShowGateOpening(nextStage.id);
    navigate('/');
  };

  return (
    <main className="lesson-page">
      <header className="lesson-header">
        <button className="lesson-back" onClick={() => navigate('/')}>← 地図へ</button>
        <span className="eyebrow">{stageIndex + 1} / {stages.length} 街</span>
        <h1>{stageName}の教材</h1>
        <p>教材 {completedUnitCount} / {units.length}</p>
        <div className="lesson-progress">
          <span style={{ '--progress-width': `${completedUnitCount / units.length * 100}%` } as React.CSSProperties} />
        </div>
      </header>

      <div className="lesson-units">
        {units.slice(0, visibleUnitCount).map((unit, index) => (
          <article
            key={unit.id}
            ref={index === visibleUnitCount - 1 && !isCompleted ? nextUnitRef : null}
            className="lesson-unit"
          >
            <p className="eyebrow">教材 {index + 1}</p>
            <h2>{unit.title}</h2>
            <p className="unit-summary">{unit.summary}</p>
            <div className="lesson-content"><p>{unit.body}</p></div>
          </article>
        ))}
      </div>

      <footer className="lesson-footer">
        <button className="course-start" onClick={finishUnit}>{primaryActionLabel} →</button>
      </footer>

      {showCertificate && (
        <dialog
          ref={certificateDialogRef}
          className="certificate-overlay"
          aria-labelledby="certificate-title"
          onClose={() => setShowCertificate(false)}
        >
          <section>
            <img src={certificateImage} alt="修了証" />
            <p className="eyebrow">COURSE COMPLETED</p>
            <h2 id="certificate-title">{stageName} 修了証</h2>
            <p>この街の教材をすべて修了しました。次の街へ進めます。</p>
            <button className="course-start" onClick={continueAfterCertificate}>
              {certificateActionLabel} →
            </button>
          </section>
        </dialog>
      )}
    </main>
  );
}

export default LessonPage;
