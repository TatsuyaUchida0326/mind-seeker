import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import './learning.css';
import mapBase from './assets/map/map-base.png';
import { stages } from './stages';
import { getCompletedStageCount, learningUnitsByStage, type LearningProgress } from './learning';
import { stageRewardIcons, statusBars } from './learningDisplay';
import { useMouseDragPan } from './useMouseDragPan';

// 演出時間の正本。src/learning.cssへはmap-svgのCSS変数として渡す
const TOWN_APPEAR_MS = 800; // 街名が現れる時間
const GATE_OPENING_BUFFER_MS = 200; // 演出が確実に終わってから教材パネルを開くための余白
const GATE_OPENING_TOTAL_MS = TOWN_APPEAR_MS + GATE_OPENING_BUFFER_MS;

// 街の座標は建物の中心。ラベルは屋根の上に出し、建物を隠さない（SVG座標での持ち上げ量）
const LABEL_HEIGHT = 30;
const LABEL_RISE_ABOVE_TOWN = 45;

// 横向きスマホ配置の判定条件。CSS側はlearning.cssの同じ条件のコメントを参照
const MOBILE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 500px)';
// 縦向きスマホ配置の判定条件。CSS側はlearning.cssの同じ条件のコメントを参照
const MOBILE_PORTRAIT_QUERY = '(orientation: portrait) and (max-width: 600px)';

// スマホ配置ではラベルを一回り大きく表示する（文字が小さすぎてタップしづらいため）。
// 縦向きは地図の縮小率が大きい分、横向きより控えめな倍率にする
const MOBILE_LABEL_SCALE_LANDSCAPE = 1.6;
const MOBILE_LABEL_SCALE_PORTRAIT = 1.3;
// PCも地図全面表示になり縮小率が上がる分、少し拡大する（1440x900で縮小率約0.83 → 14 × 1.15 × 0.83 ≒ 13.4px）
const DESKTOP_LABEL_SCALE = 1.15;

// 地図の上に重なるパネル類。ここから始めたマウスのドラッグでは地図を動かさない
const MAP_OVERLAY_SELECTOR = '.progress-container, .hud-drawer, .hud-toggle-buttons, .course-panel';

function polygonPoints(values: number[], size: number) {
  return values.map((value, index) => {
    const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
    const radius = (size / 2) * 0.8 * value / 100;
    return `${size / 2 + radius * Math.cos(angle)},${size / 2 + radius * Math.sin(angle)}`;
  }).join(' ');
}

// メディアクエリの一致状況を購読する小さなフック。画面回転などで倍率を追従させるために使う
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);
    handleChange();
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

interface Props {
  progress: LearningProgress;
  stageWithGateOpening: string | null;
  onShowGateOpening: (stage: string | null) => void;
}

function App({ progress, stageWithGateOpening, onShowGateOpening }: Props) {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [animatingStageId, setAnimatingStageId] = useState<string | null>(null);
  const [openHudDrawer, setOpenHudDrawer] = useState<'items' | 'stats' | null>(null);
  const [viewportSize, setViewportSize] = useState(() => `${window.innerWidth}x${window.innerHeight}`);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const stageButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const mapScrollAreaRef = useRef<HTMLDivElement>(null);
  useMouseDragPan(mapScrollAreaRef, MAP_OVERLAY_SELECTOR);
  const isMobileLandscape = useMediaQuery(MOBILE_LANDSCAPE_QUERY);
  const isMobilePortrait = useMediaQuery(MOBILE_PORTRAIT_QUERY);
  useEffect(() => {
    const updateViewportSize = () => setViewportSize(`${window.innerWidth}x${window.innerHeight}`);
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);
  const labelScale = isMobilePortrait ? MOBILE_LABEL_SCALE_PORTRAIT : isMobileLandscape ? MOBILE_LABEL_SCALE_LANDSCAPE : DESKTOP_LABEL_SCALE;
  const labelHeight = LABEL_HEIGHT * labelScale;
  // ラベルが大きくなった分の半分だけ持ち上げを増やし、屋根の上に収まるようにする
  const labelRiseAboveTown = LABEL_RISE_ABOVE_TOWN + (labelHeight - LABEL_HEIGHT) / 2;
  const completedCount = getCompletedStageCount(progress);
  const currentIndex = Math.min(completedCount, stages.length - 1);
  const selectedIndex = stages.findIndex(stage => stage.id === selectedStage);
  const selectedStageName = stages[selectedIndex]?.name;
  const selectedIsOpen = selectedIndex >= 0 && selectedIndex <= currentIndex;

  // 演出中にレッスンへ遷移して戻っても再生し直さないよう、prop を受け取った瞬間にすぐ消費する
  useEffect(() => {
    if (stageWithGateOpening) {
      setAnimatingStageId(stageWithGateOpening);
      onShowGateOpening(null);
    }
  }, [stageWithGateOpening, onShowGateOpening]);

  // 演出が終わったら教材パネルを開く。演出中にユーザーが別の街を開いていたら上書きしない
  useEffect(() => {
    if (!animatingStageId) return;
    const openedStageId = animatingStageId;
    const timer = window.setTimeout(() => {
      setAnimatingStageId(null);
      setSelectedStage(current => current ?? openedStageId);
    }, GATE_OPENING_TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, [animatingStageId]);

  useEffect(() => {
    if (selectedStage) panelHeadingRef.current?.focus();
  }, [selectedStage]);

  // 開いたとき・現在の街が進んだときに、その街のラベルを画面中央へ寄せる。
  // .map-wrapperが自前のスクロール領域(position: fixed; inset: 0; overflow: auto)になっているため、
  // scrollIntoViewが動いてもページ全体はスクロールしない
  useEffect(() => {
    const currentStageId = stages[currentIndex]?.id;
    if (!currentStageId) return;
    stageButtonRefs.current.get(currentStageId)?.scrollIntoView({ block: 'center', inline: 'center' });
  }, [currentIndex, isMobileLandscape, isMobilePortrait, viewportSize]);

  const closeStagePanel = useCallback(() => {
    setSelectedStage(null);
    if (selectedStage) stageButtonRefs.current.get(selectedStage)?.focus();
  }, [selectedStage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // 引き出し（アイテム／能力値）が開いていればそちらを先に閉じる
      if (openHudDrawer) { setOpenHudDrawer(null); return; }
      closeStagePanel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeStagePanel, openHudDrawer]);

  const openStage = (stageId: string, index: number) => {
    if (index <= currentIndex) setSelectedStage(stageId);
  };

  return (
    <div ref={mapScrollAreaRef} className="map-wrapper learning-home">
      {openHudDrawer === 'items' && (
        <div id="inventory-drawer" className="inventory-container hud-drawer">
          <button type="button" className="hud-drawer-close" onClick={() => setOpenHudDrawer(null)} aria-label="アイテム欄を閉じる">×</button>
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
      )}

      <section className="progress-container learning-progress" aria-label="学習の進捗">
        <div className="learning-progress-count">ステージ {Math.min(completedCount + 1, stages.length)} / {stages.length}</div>
        <div className="exp-bar-container"><div className="exp-bar-bg"><div className="exp-bar-fill" style={{ '--progress-width': `${completedCount / stages.length * 100}%` } as CSSProperties} /></div></div>
        <div className="progress-title">修了した街 {completedCount} / {stages.length}</div>
      </section>

      {openHudDrawer === 'stats' && (
        <section id="stats-drawer" className="stats-container hud-drawer" aria-label="成長パラメーター">
          <button type="button" className="hud-drawer-close" onClick={() => setOpenHudDrawer(null)} aria-label="能力値欄を閉じる">×</button>
          <div className="status-bars">
            {statusBars.map(status => <div key={status.label} className="status-item"><span className="status-label">{status.label}</span><div className="status-bar-bg"><div className="status-bar-fill knowledge" style={{ '--progress-width': `${status.value}%` } as CSSProperties} /></div></div>)}
          </div>
          <div className="radar-chart">
            <svg className="radar-svg" viewBox="0 0 100 100" aria-hidden="true"><polygon className="radar-bg" points={polygonPoints(statusBars.map(() => 100), 100)} /><polygon className="radar-data" points={polygonPoints(statusBars.map(status => status.value), 100)} /></svg>
            <div className="radar-labels radar-label-vitality">体力</div><div className="radar-labels radar-label-mental">精神力</div><div className="radar-labels radar-label-action">行動力</div><div className="radar-labels radar-label-cooperation">協調性</div><div className="radar-labels radar-label-knowledge">知識</div><div className="radar-labels radar-label-persistence">継続力</div>
          </div>
        </section>
      )}

      <div className="hud-toggle-buttons">
        <button type="button" className="hud-toggle-button" aria-expanded={openHudDrawer === 'items'} aria-controls="inventory-drawer" onClick={() => setOpenHudDrawer(current => current === 'items' ? null : 'items')}>アイテム</button>
        <button type="button" className="hud-toggle-button" aria-expanded={openHudDrawer === 'stats'} aria-controls="stats-drawer" onClick={() => setOpenHudDrawer(current => current === 'stats' ? null : 'stats')}>能力値</button>
      </div>

      <svg viewBox="0 0 1920 1080" className={`map-svg${selectedStage ? ' panel-open' : ''}`} role="group" aria-label="学習する街を選択">
        <image href={mapBase} x="0" y="0" width="1920" height="1080" />
        {stages.map((stage, index) => {
          // 未到達の街は名前ごと表示しない。修了するたびに次の街が1つずつ現れる
          if (index > currentIndex) return null;
          const isCompleted = progress.completedStageIds.includes(stage.id);
          // 跳ねるのは現在の街かつ未修了のときだけ（全街修了後に最後の街が跳ね続けないように）
          const isCurrent = index === currentIndex && !isCompleted;
          const labelWidth = Math.max(80, stage.name.length * 16 + 20) * labelScale;
          return <g key={stage.id} transform={`translate(${stage.x}, ${stage.y})`} className={`town-node ${animatingStageId === stage.id ? 'town-unlocking' : ''}`}>
            <g className={isCurrent ? 'jump-group' : ''}>
              <foreignObject x={-labelWidth / 2} y={-labelRiseAboveTown - labelHeight / 2} width={labelWidth} height={labelHeight} style={{ '--label-font-size': `${14 * labelScale}px` } as CSSProperties}><button ref={button => { if (button) stageButtonRefs.current.set(stage.id, button); }} type="button" className="label-frame town-label" aria-label={`${stage.name}${isCompleted ? '、修了済み' : '、学習可能'}`} aria-expanded={selectedStage === stage.id} aria-controls="course-panel" onClick={() => openStage(stage.id, index)}><span className="label-text">{stage.name}</span></button></foreignObject>
            </g>
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
