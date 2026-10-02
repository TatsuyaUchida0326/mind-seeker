import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Opening from './Opening';
import './App.css';
import { stages } from './stages';
import { CharacterPreview } from './world/CharacterPreview';
import { MessageScreen } from './world/MessageScreen';
import WorldLesson from './world/WorldLesson';
import type { WorldLessonProps } from './world/WorldLesson';
import WorldMap from './world/WorldMap';
import {
  conflictMessage,
  dismissMigrationNotice,
  isSameProgress,
  isStorageEventForProgress,
  loadOrCreateWorldProgress,
  migrationNoticeMessage,
  progressResetEnabled,
  readLatestProgress,
  resetWorldProgress,
  saveErrorMessage,
  saveWorldProgress,
  shouldShowMigrationNotice,
  unreadableMessage,
} from './world/progress';
import type { WorldProgress } from './world/progress';
import type { Notice } from './world/NoticeRegion';
import './world/world.css';

function LegacyLessonGuide() {
  const navigate = useNavigate();
  return (
    <MessageScreen
      title="新しい世界地図へ移りました"
      messages={['以前の街のURLはこのまま開けません。地図から、今の目的地を選んで学習を続けてください。']}
      actionLabel="世界地図を開く"
      onAction={() => navigate('/')}
    />
  );
}

function LessonRoute(props: WorldLessonProps) {
  const { placeId = '' } = useParams();
  const isLegacyStage = stages.some((stage) => stage.id === placeId);
  return isLegacyStage ? <LegacyLessonGuide /> : <WorldLesson {...props} />;
}

function BlockedScreen({ error }: { error: string }) {
  return (
    <MessageScreen
      title="進捗を安全に開けません"
      messages={[error, '記録を上書きしないため、学習画面は開いていません。保存領域を確認してから再試行してください。']}
      actionLabel="再試行"
      onAction={() => window.location.reload()}
    />
  );
}

interface ShownNotice {
  notice: Notice;
  dismiss: () => void;
}

function LearningApp({ initialProgress }: { initialProgress: WorldProgress }) {
  const [progress, setProgress] = useState(initialProgress);
  // 保存まわりのお知らせ（保存の失敗・別の画面との食い違い）
  const [storageNotice, setStorageNotice] = useState<Notice | null>(null);

  // 別のタブで進んだ記録を取り込み、古い画面の記録で上書きしないようにする
  useEffect(() => {
    const syncFromOtherTab = (event: StorageEvent) => {
      if (!isStorageEventForProgress(event)) return;
      const latest = readLatestProgress();
      if (latest.kind === 'ok') setProgress(latest.progress);
    };
    window.addEventListener('storage', syncFromOtherTab);
    return () => window.removeEventListener('storage', syncFromOtherTab);
  }, []);

  const saveProgress = useCallback((next: WorldProgress) => {
    const latest = readLatestProgress();
    if (latest.kind === 'unreadable') {
      setStorageNotice({ kind: 'error', text: unreadableMessage });
      return false;
    }
    if (latest.kind === 'ok' && !isSameProgress(latest.progress, progress)) {
      setProgress(latest.progress);
      setStorageNotice({ kind: 'info', text: conflictMessage });
      return false;
    }
    if (!saveWorldProgress(next)) {
      setStorageNotice({ kind: 'error', text: saveErrorMessage });
      return false;
    }
    setProgress(next);
    setStorageNotice(null);
    return true;
  }, [progress]);

  const clearStorageNotice = useCallback(() => setStorageNotice(null), []);

  // 地図に出すお知らせと、その閉じ方を1か所で決める。保存まわりのお知らせを先に出し、
  // それを閉じても引き継ぎのお知らせは既読にしない
  const chooseMapNotice = (): ShownNotice | null => {
    if (storageNotice) return { notice: storageNotice, dismiss: clearStorageNotice };
    if (shouldShowMigrationNotice(progress)) {
      return { notice: { kind: 'info', text: migrationNoticeMessage }, dismiss: () => saveProgress(dismissMigrationNotice(progress)) };
    }
    return null;
  };
  const mapNotice = chooseMapNotice();
  // 設定で止めているときは渡さず、ボタンも出さない
  const resetProgress = progressResetEnabled ? () => saveProgress(resetWorldProgress(progress)) : undefined;
  const map = <WorldMap progress={progress} notice={mapNotice?.notice ?? null} onDismissNotice={mapNotice?.dismiss ?? clearStorageNotice} onResetProgress={resetProgress} />;
  const goToMap = () => { window.location.href = import.meta.env.BASE_URL; };

  return (
    <Routes>
      <Route path="/opening" element={<Opening onFinish={goToMap} />} />
      <Route path="/" element={map} />
      <Route path="/lesson/:placeId" element={<LessonRoute progress={progress} onSaveProgress={saveProgress} notice={storageNotice} onDismissNotice={clearStorageNotice} />} />
      <Route path="*" element={map} />
    </Routes>
  );
}

function LearningRoot() {
  const [initial] = useState(loadOrCreateWorldProgress);
  return initial.ok ? <LearningApp initialProgress={initial.progress} /> : <BlockedScreen error={initial.error} />;
}

function Root() {
  // 開発用プレビューは進捗を読んだり保存したりしない独立画面にする。
  if (import.meta.env.DEV && window.location.pathname === '/character-preview') return <CharacterPreview />;
  return <LearningRoot />;
}

export default Root;
