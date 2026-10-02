import { legacyLessonIdsOf, legacyProgressStorageKey } from '../lessons/legacyLessonIds';
import { stages } from '../stages';
import { phases } from './story';
import type { Item, Phase, Place } from './story';

const schemaVersion = 5;
const worldProgressKey = `mind-seeker-progress-v${schemaVersion}`;

export const saveErrorMessage = '進捗を保存できません。空き容量を確認してから、もう一度お試しください。';
export const conflictMessage = '別の画面で学習が進んでいたため、最新の記録を読み込みました。';
export const migrationNoticeMessage = '旧版の修了記録を、新しい世界地図へ引き継ぎました。';
const legacyReadError = '旧版の記録を読み込めません。既存の記録は保護されています。';
const unavailableError = 'このブラウザでは保存領域を利用できません。';
export const unreadableMessage = '保存データを読み込めません。既存の記録は保護されています。';

export interface WorldProgress {
  schemaVersion: typeof schemaVersion;
  // フェーズは順番にしか進めないため、常に phases の先頭からの並びになる
  completedPhaseIds: string[];
  // 旧36街版から引き継いだフェーズ数と、そのお知らせを利用者が閉じたか
  migration: { legacyPhaseCount: number; noticeDismissed: boolean };
}

export type LoadResult = { ok: true; progress: WorldProgress } | { ok: false; error: string };

export type PlaceState = 'done' | 'current' | 'locked';

// 装備は equipment を必ず持つアイテム
export type EquipmentItem = Item & { equipment: NonNullable<Item['equipment']> };

// 保存済みの記録を読み直した結果。「無い」と「読めない」を分け、読めない記録は上書きしない
export type LatestRead = { kind: 'absent' } | { kind: 'unreadable' } | { kind: 'ok'; progress: WorldProgress };

type StorageRead = { available: true; value: string | null } | { available: false };

function readStorage(key: string): StorageRead {
  try {
    return { available: true, value: localStorage.getItem(key) };
  } catch {
    return { available: false };
  }
}

function hasOwn(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isPhasePrefix(ids: unknown[]): ids is string[] {
  return ids.length <= phases.length && ids.every((id, index) => id === phases[index].id);
}

// 旧36街版は、先頭から続けて修了した街の数を、30フェーズの同じ割合に換算する（切り捨て）
function readLegacyPhaseCount(): { count: number } | { error: string } {
  const read = readStorage(legacyProgressStorageKey);
  if (!read.available) return { error: legacyReadError };
  if (read.value === null) return { count: 0 };
  try {
    const parsed: unknown = JSON.parse(read.value);
    if (!parsed || typeof parsed !== 'object' || !hasOwn(parsed, 'completedLessonIds')) return { error: legacyReadError };
    const lessons = (parsed as { completedLessonIds: unknown }).completedLessonIds;
    if (!Array.isArray(lessons) || lessons.some((value) => typeof value !== 'string')) return { error: legacyReadError };
    const completedLessons = new Set(lessons);
    const isStageCompleted = (stageId: string) => legacyLessonIdsOf(stageId).every((id) => completedLessons.has(id));
    const firstUnfinished = stages.findIndex((stage) => !isStageCompleted(stage.id));
    const completedStageCount = firstUnfinished < 0 ? stages.length : firstUnfinished;
    return { count: Math.floor(completedStageCount * phases.length / stages.length) };
  } catch {
    return { error: legacyReadError };
  }
}

// 形が少しでも違う記録は直さずに捨てる（null）。呼び出し側は上書きせずに止める
function parseWorldProgress(value: unknown): WorldProgress | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as Partial<WorldProgress>;
  if (source.schemaVersion !== schemaVersion || !Array.isArray(source.completedPhaseIds) || !isPhasePrefix(source.completedPhaseIds)) return null;
  const migration = source.migration;
  if (!migration || typeof migration !== 'object' || typeof migration.noticeDismissed !== 'boolean') return null;
  const legacyCount = migration.legacyPhaseCount;
  if (!Number.isInteger(legacyCount) || legacyCount < 0 || legacyCount > source.completedPhaseIds.length) return null;
  return {
    schemaVersion,
    completedPhaseIds: source.completedPhaseIds,
    migration: { legacyPhaseCount: legacyCount, noticeDismissed: migration.noticeDismissed },
  };
}

function parseStored(raw: string): WorldProgress | null {
  try {
    return parseWorldProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveWorldProgress(progress: WorldProgress): boolean {
  try {
    localStorage.setItem(worldProgressKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

// 記録が無ければ、旧36街版から換算した記録をここで作って保存する。
// 10章版（v2・v3）と開発中の v4 は公開されていないため引き継がない。既存のどの版の記録も書き換えない
export function loadOrCreateWorldProgress(): LoadResult {
  const read = readStorage(worldProgressKey);
  if (!read.available) return { ok: false, error: unavailableError };
  if (read.value !== null) {
    const progress = parseStored(read.value);
    return progress ? { ok: true, progress } : { ok: false, error: unreadableMessage };
  }

  const legacy = readLegacyPhaseCount();
  if ('error' in legacy) return { ok: false, error: legacy.error };
  const progress: WorldProgress = {
    schemaVersion,
    completedPhaseIds: phases.slice(0, legacy.count).map((phase) => phase.id),
    migration: { legacyPhaseCount: legacy.count, noticeDismissed: false },
  };
  if (!saveWorldProgress(progress)) return { ok: false, error: saveErrorMessage };
  return { ok: true, progress };
}

// 別のタブが書いたかもしれない、保存済みの最新の記録
export function readLatestProgress(): LatestRead {
  const read = readStorage(worldProgressKey);
  if (!read.available) return { kind: 'unreadable' };
  if (read.value === null) return { kind: 'absent' };
  const progress = parseStored(read.value);
  return progress ? { kind: 'ok', progress } : { kind: 'unreadable' };
}

export function isStorageEventForProgress(event: StorageEvent): boolean {
  return event.key === worldProgressKey;
}

// 修了の並びは常に phases の先頭からなので、数が同じなら中身も同じ
export function isSameProgress(a: WorldProgress, b: WorldProgress): boolean {
  return a.completedPhaseIds.length === b.completedPhaseIds.length
    && a.migration.legacyPhaseCount === b.migration.legacyPhaseCount
    && a.migration.noticeDismissed === b.migration.noticeDismissed;
}

export function shouldShowMigrationNotice(progress: WorldProgress): boolean {
  return progress.migration.legacyPhaseCount > 0 && !progress.migration.noticeDismissed;
}

export function dismissMigrationNotice(progress: WorldProgress): WorldProgress {
  return { ...progress, migration: { ...progress.migration, noticeDismissed: true } };
}

export function completedPhaseCount(progress: WorldProgress): number {
  return progress.completedPhaseIds.length;
}

// 今学ぶ（次に修了する）フェーズ。全フェーズを修了していれば undefined
export function currentPhaseOf(progress: WorldProgress): Phase | undefined {
  return phases[completedPhaseCount(progress)];
}

// その目的地で今学ぶフェーズ。現在地でなければ null
export function currentPhaseIn(progress: WorldProgress, place: Place): Phase | null {
  const phase = currentPhaseOf(progress);
  return phase && place.phases.includes(phase) ? phase : null;
}

export function isPhaseComplete(progress: WorldProgress, phaseId: string): boolean {
  return progress.completedPhaseIds.includes(phaseId);
}

export function completedPhaseCountIn(progress: WorldProgress, place: Place): number {
  return place.phases.filter((phase) => isPhaseComplete(progress, phase.id)).length;
}

export function completePhase(progress: WorldProgress, phaseId: string): WorldProgress | null {
  if (currentPhaseOf(progress)?.id !== phaseId) return null;
  return { ...progress, completedPhaseIds: [...progress.completedPhaseIds, phaseId] };
}

// テスト運転の期間だけ、持ち物パネルに「最初からやり直す」を出す（公開サイトにも出る）
// TODO: テスト運転が終わったら false にする
export const progressResetEnabled = true;

// 修了したフェーズと持ち物をすべて消し、旅立ち前の状態に戻す
export function resetWorldProgress(progress: WorldProgress): WorldProgress {
  return { ...progress, completedPhaseIds: [], migration: { legacyPhaseCount: 0, noticeDismissed: true } };
}

export function placeState(progress: WorldProgress, place: Place): PlaceState {
  if (completedPhaseCountIn(progress, place) === place.phases.length) return 'done';
  return currentPhaseIn(progress, place) ? 'current' : 'locked';
}

function ownedItems(progress: WorldProgress): Item[] {
  return phases.slice(0, completedPhaseCount(progress)).map((phase) => phase.item);
}

// 装備は手に入れた時点で身につける。身につけた数が主人公の姿の段階になる
export function wornEquipment(progress: WorldProgress): EquipmentItem[] {
  return ownedItems(progress).filter((item): item is EquipmentItem => item.equipment !== undefined);
}

// 装備以外の持ち物
export function ownedKeepsakes(progress: WorldProgress): Item[] {
  return ownedItems(progress).filter((item) => item.equipment === undefined);
}
