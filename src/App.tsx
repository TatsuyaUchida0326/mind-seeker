import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import './learning.css';
import mapImage from './assets/map.png';
import { stages } from './stages';
import { getCompletedStageCount, learningUnitsByStage, type LearningProgress } from './learning';
import { stageRewardIcons, statusBars } from './learningDisplay';

function polygonPoints(values: number[], size: number) {
  return values.map((value, index) => {
    const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
    const radius = (size / 2) * 0.8 * value / 100;
    return `${size / 2 + radius * Math.cos(angle)},${size / 2 + radius * Math.sin(angle)}`;
  }).join(' ');
}

interface Props {
  progress: LearningProgress;
  stageWithGateOpening: string | null;
  onShowGateOpening: (stage: string | null) => void;
}

function App({ progress, stageWithGateOpening, onShowGateOpening }: Props) {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const stageButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const completedCount = getCompletedStageCount(progress);
  const currentIndex = Math.min(completedCount, stages.length - 1);
  const selectedIndex = stages.findIndex(stage => stage.id === selectedStage);
  const selectedStageName = stages[selectedIndex]?.name;
  const selectedIsOpen = selectedIndex >= 0 && selectedIndex <= currentIndex;

  useEffect(() => {
    if (stageWithGateOpening) {
      setSelectedStage(stageWithGateOpening);
      const timer = window.setTimeout(() => onShowGateOpening(null), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [stageWithGateOpening, onShowGateOpening]);

  useEffect(() => {
    if (selectedStage) panelHeadingRef.current?.focus();
  }, [selectedStage]);

  const closeStagePanel = useCallback(() => {
    setSelectedStage(null);
    if (selectedStage) stageButtonRefs.current.get(selectedStage)?.focus();
  }, [selectedStage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeStagePanel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeStagePanel]);

  const openStage = (stageId: string, index: number) => {
    if (index <= currentIndex) setSelectedStage(stageId);
  };

  return (
    <div className="map-wrapper learning-home">
      <div className="inventory-container">
        <div className="inventory-title">習得アイテム</div>
        <div className="inventory-grid" role="list">
          {stages.map((stage, index) => (
            <div key={stage.name} className={`inventory-slot ${index < completedCount ? 'obtained' : ''}`} role="listitem">
              {index < completedCount && <span className="item-icon" aria-hidden="true">{stageRewardIcons[index % stageRewardIcons.length]}</span>}
              <span className="visually-hidden">{index < completedCount ? `${stage.name}の修了証` : '未取得'}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="progress-container learning-progress" aria-label="学習の進捗">
        <div className="learning-progress-count">ステージ {Math.min(completedCount + 1, stages.length)} / {stages.length}</div>
        <div className="exp-bar-container"><div className="exp-bar-bg"><div className="exp-bar-fill" style={{ '--progress-width': `${completedCount / stages.length * 100}%` } as CSSProperties} /></div></div>
        <div className="progress-title">修了した街 {completedCount} / {stages.length}</div>
      </section>

      <section className="stats-container" aria-label="成長パラメーター">
        <div className="status-bars">
          {statusBars.map(status => <div key={status.label} className="status-item"><span className="status-label">{status.label}</span><div className="status-bar-bg"><div className="status-bar-fill knowledge" style={{ '--progress-width': `${status.value}%` } as CSSProperties} /></div></div>)}
        </div>
        <div className="radar-chart">
          <svg className="radar-svg" viewBox="0 0 100 100" aria-hidden="true"><polygon className="radar-bg" points={polygonPoints(statusBars.map(() => 100), 100)} /><polygon className="radar-data" points={polygonPoints(statusBars.map(status => status.value), 100)} /></svg>
          <div className="radar-labels radar-label-vitality">体力</div><div className="radar-labels radar-label-mental">精神力</div><div className="radar-labels radar-label-action">行動力</div><div className="radar-labels radar-label-cooperation">協調性</div><div className="radar-labels radar-label-knowledge">知識</div><div className="radar-labels radar-label-persistence">継続力</div>
        </div>
      </section>

      <svg viewBox="0 0 1920 1080" className="map-svg" role="group" aria-label="学習する街を選択">
        <image href={mapImage} x="0" y="0" width="1920" height="1080" />
        {stages.map((stage, index) => {
          const isCompleted = progress.completedStageIds.includes(stage.id);
          const isAvailable = index <= currentIndex;
          const isNext = index === currentIndex + 1;
          const labelWidth = Math.max(80, stage.name.length * 16 + 20);
          return <g key={stage.id} transform={`translate(${stage.x}, ${stage.y})`} className={`town-node ${isAvailable ? 'town-available' : 'town-locked'} ${isCompleted ? 'town-completed' : ''} ${stageWithGateOpening === stage.id ? 'town-unlocking' : ''}`}>
            <foreignObject x={-28} y={-30} width="56" height="56"><button ref={button => { if (button) stageButtonRefs.current.set(stage.id, button); }} type="button" className="town-hit-area" aria-label={`${stage.name}${isCompleted ? '、修了済み' : isAvailable ? '、学習可能' : isNext ? '、次の街、前の街を修了すると解放' : '、ロック中'}`} aria-expanded={selectedStage === stage.id} aria-controls="course-panel" disabled={!isAvailable} onClick={() => openStage(stage.id, index)}>{isCompleted ? '✓' : isAvailable ? '▤' : isNext ? '▣' : '🔒'}</button></foreignObject>
            <foreignObject x={-labelWidth / 2} y={24} width={labelWidth} height={30}><div className="label-frame"><span className="label-text">{stage.name}</span></div></foreignObject>
          </g>;
        })}
      </svg>

      {selectedStage && selectedStageName && selectedIsOpen && <>
        <button className="learning-dismiss" aria-label="街の教材パネルを閉じる" onClick={closeStagePanel} />
        <section id="course-panel" className="course-panel" aria-label={`${selectedStageName}の教材`}>
          <button type="button" className="panel-close" onClick={closeStagePanel} aria-label="閉じる">×</button>
          <p className="eyebrow">街の教材</p><h2 ref={panelHeadingRef} tabIndex={-1}>{selectedStageName}</h2>
          <p>{progress.completedStageIds.includes(selectedStage) ? '修了証を獲得しました' : '街のすべての教材を修了すると、修了証を獲得できます。'}</p>
          <div className="unit-preview-list">{learningUnitsByStage[selectedStage].map((unit, index) => {
            const isUnitComplete = progress.completedLessonIds.includes(unit.id);
            const isUnitAvailable = isUnitComplete || index === learningUnitsByStage[selectedStage].findIndex(candidate => !progress.completedLessonIds.includes(candidate.id));
            return <span key={unit.id}>{isUnitComplete ? '✓' : isUnitAvailable ? '📖' : '🔒'} {unit.title}</span>;
          })}</div>
          <button className="course-start" onClick={() => navigate(`/lesson/${selectedStage}`)}>{progress.completedStageIds.includes(selectedStage) ? '教材を見返す' : '教材を続ける'} →</button>
        </section>
      </>}
    </div>
  );
}

export default App;
