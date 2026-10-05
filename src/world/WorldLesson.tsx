import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageScreen } from './MessageScreen';
import { NoticeRegion } from './NoticeRegion';
import { CharacterPromotion } from './CharacterPromotion';
import type { Notice } from './NoticeRegion';
import { ProgressMeter } from './ProgressMeter';
import { completePhase, completedPhaseCountIn, currentPhaseIn, isPhaseComplete, placeState, wornEquipment } from './progress';
import type { WorldProgress } from './progress';
import { chapterOfPlace, equipmentCount, findPlace, phases, placeKindLabel, placeOfPhase } from './story';
import type { Phase } from './story';
import { scrollBehavior } from './motion';
import { characterPromotionForCompletion } from './characterStages';

export interface WorldLessonProps {
  progress: WorldProgress;
  // 保存できたら true。保存できなかった理由は notice で受け取る
  onSaveProgress: (progress: WorldProgress) => boolean;
  notice: Notice | null;
  onDismissNotice: () => void;
}

type PhaseStatus = 'done' | 'current' | 'upcoming';

// アイテムを手に入れたあとの行き先
type AfterAcquire = 'samePlace' | 'nextPlace' | 'finished';

const proceedLabels: Record<AfterAcquire, string> = {
  samePlace: '次のフェーズへ',
  nextPlace: '次の街へ →',
  finished: '世界地図へ戻る',
};

interface PhaseArticleProps {
  phase: Phase;
  status: PhaseStatus;
  // 先頭のフェーズは見出しのすぐ下にあるので、送ると目的地名が隠れる
  scrollWhenCurrent: boolean;
  onComplete: () => void;
}

function PhaseArticle({ phase, status, scrollWhenCurrent, onComplete }: PhaseArticleProps) {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status !== 'current' || !scrollWhenCurrent) return;
    articleRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }, [status, scrollWhenCurrent]);

  if (status === 'upcoming') {
    return (
      <article className="upcoming" aria-labelledby={`${phase.id}-title`}>
        <p className="card-eyebrow">PHASE {phase.number}</p>
        <h2 id={`${phase.id}-title`}>{phase.title}</h2>
        <p className="phase-locked"><span aria-hidden="true">🔒</span> フェーズ{phase.number - 1}を修了すると読めます。</p>
      </article>
    );
  }

  return (
    <article ref={articleRef} className={status} aria-labelledby={`${phase.id}-title`}>
      <p className="card-eyebrow">PHASE {phase.number}{status === 'current' && '・いま学ぶフェーズ'}</p>
      <h2 id={`${phase.id}-title`}>{phase.title}</h2>
      <strong>{phase.subtitle}</strong>
      {phase.story ? (
        <section aria-label="物語">
          {phase.story.map((block) => (
            <div key={block.text}>
              {block.heading && <h3>{block.heading}</h3>}
              <p>{block.text}</p>
            </div>
          ))}
        </section>
      ) : (
        <p className="phase-pending">この章の物語は、地図とあわせて準備中です。</p>
      )}
      {phase.questions.length > 0 && (
        <section className="phase-questions" aria-labelledby={`${phase.id}-questions`}>
          <h3 id={`${phase.id}-questions`}>問い</h3>
          <ul>{phase.questions.map((question) => <li key={question}>{question}</li>)}</ul>
        </section>
      )}
      <section className="phase-training" aria-labelledby={`${phase.id}-training`}>
        <h3 id={`${phase.id}-training`}>研修テーマ：{phase.trainingTheme}</h3>
        {/* TODO: 研修内容の本文を受け取ったら差し込む（docs/story-structure.md「教材ページ」） */}
        <p>研修内容は準備中です。</p>
      </section>
      {status === 'done' && <em>✓ 修了。「{phase.item.name}」を手に入れました。</em>}
      {status === 'current' && (
        <div className="phase-complete">
          <button className="lesson-next" onClick={onComplete}>フェーズ{phase.number}を修了する →</button>
        </div>
      )}
    </article>
  );
}

function phaseStatus(progress: WorldProgress, phase: Phase, currentPhase: Phase | null): PhaseStatus {
  if (isPhaseComplete(progress, phase.id)) return 'done';
  return phase === currentPhase ? 'current' : 'upcoming';
}

export default function WorldLesson({ progress, onSaveProgress, notice, onDismissNotice }: WorldLessonProps) {
  const { placeId = '' } = useParams();
  const navigate = useNavigate();
  const [acquiredPhase, setAcquiredPhase] = useState<Phase | null>(null);
  const acquiredDialogRef = useRef<HTMLDialogElement>(null);
  const place = findPlace(placeId);

  // お知らせ（保存の失敗など）は画面下に出るため、押し直す修了ボタンがお知らせに隠れないよう画面の中ほどへ送る
  useEffect(() => {
    if (!notice) return;
    document.querySelector('.lesson-next')?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
  }, [notice]);

  useEffect(() => {
    const dialog = acquiredDialogRef.current;
    if (acquiredPhase && dialog && !dialog.open) {
      dialog.showModal();
      // 最初のボタンにフォーカスが移ると中身が下へ送られ、低い画面では見出しが隠れるため先頭へ戻す
      dialog.scrollTop = 0;
    }
    if (!acquiredPhase && dialog?.open) dialog.close();
  }, [acquiredPhase]);

  const state = place ? placeState(progress, place) : null;
  if (!place || state === 'locked') {
    const message = place ? 'この目的地はまだ開いていません。前の目的地を修了すると進めます。' : 'この目的地は見つかりません。';
    return <MessageScreen title="目的地を開けません" messages={[message]} actionLabel="地図へ戻る" onAction={() => navigate('/')} />;
  }

  const chapter = chapterOfPlace(place);
  const currentPhase = currentPhaseIn(progress, place);
  const completedCount = completedPhaseCountIn(progress, place);

  const followingPhase = acquiredPhase ? phases[phases.indexOf(acquiredPhase) + 1] : undefined;
  const followingPlace = followingPhase ? placeOfPhase(followingPhase) : null;
  const afterAcquire: AfterAcquire = followingPlace === place ? 'samePlace' : followingPlace ? 'nextPlace' : 'finished';
  const promotion = acquiredPhase ? characterPromotionForCompletion(acquiredPhase.number) : null;

  const completeCurrentPhase = () => {
    if (!currentPhase) return;
    const updatedProgress = completePhase(progress, currentPhase.id);
    if (updatedProgress && onSaveProgress(updatedProgress)) setAcquiredPhase(currentPhase);
  };

  // ダイアログの close イベントは画面が裏にあると届かないことがあるため、ボタンと Esc キーから直接進める
  const proceed = () => {
    if (afterAcquire === 'samePlace') {
      setAcquiredPhase(null);
      return;
    }
    navigate('/', { state: followingPlace ? { journeyFromId: place.id, journeyToId: followingPlace.id } : null });
  };

  return (
    <main className="world-lesson">
      <header>
        <button onClick={() => navigate('/')}>← 地図へ戻る</button>
        <p>CHAPTER {chapter.number}・{chapter.title}</p>
        <h1>{place.name}</h1>
        <span>{placeKindLabel(place)}・フェーズ {completedCount} / {place.phases.length}</span>
        <ProgressMeter className="lesson-meter" ratio={completedCount / place.phases.length} />
      </header>

      <section className="lesson-card">
        {place.phases.map((phase, index) => (
          <PhaseArticle
            key={phase.id}
            phase={phase}
            status={phaseStatus(progress, phase, currentPhase)}
            scrollWhenCurrent={index > 0}
            onComplete={completeCurrentPhase}
          />
        ))}
      </section>

      {state === 'done' && !acquiredPhase && (
        <footer>
          <p>{place.name}のフェーズはすべて修了しています。</p>
        </footer>
      )}

      {/* 修了ボタンを押した位置から見えるよう、お知らせは画面の下に留める */}
      <NoticeRegion
        className="lesson-notices"
        notice={notice}
        onDismiss={onDismissNotice}
        fallbackFocusSelectors={['.lesson-next', '.world-lesson > header button']}
      />

      <dialog
        ref={acquiredDialogRef}
        className="world-certificate"
        onCancel={(event) => { event.preventDefault(); setAcquiredPhase(null); navigate('/'); }}
        aria-labelledby="acquired-title"
      >
        {acquiredPhase && (
          <>
            <p className="card-eyebrow">PHASE {acquiredPhase.number} COMPLETED</p>
            {/* 名前の途中で改行しないよう、名前はひとかたまりにする */}
            <h2 id="acquired-title"><span className="item-name">「{acquiredPhase.item.name}」</span>を手に入れた</h2>
            {promotion && <CharacterPromotion key={acquiredPhase.id} beforeStage={promotion.before} afterStage={promotion.after} />}
            <p>{acquiredPhase.item.effect}</p>
            <p className="item-keyword">{acquiredPhase.item.keyword}</p>
            {acquiredPhase.item.equipment && (
              <p className="item-equipment">装備：{acquiredPhase.item.equipment.appearance}<span className="no-wrap">（身につけた装備 {wornEquipment(progress).length} / {equipmentCount}）</span></p>
            )}
            {afterAcquire === 'nextPlace' && followingPlace && <p>{place.name}を修了しました。次の目的地は「{followingPlace.name}」です。</p>}
            {afterAcquire === 'finished' && <p>すべてのフェーズを修了しました。本当の冒険はここからです。</p>}
            <button className="dialog-action" onClick={proceed}>{proceedLabels[afterAcquire]}</button>
          </>
        )}
      </dialog>
    </main>
  );
}
