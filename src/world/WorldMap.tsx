import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { NoticeRegion } from './NoticeRegion';
import type { Notice } from './NoticeRegion';
import { ProgressMeter } from './ProgressMeter';
import { useLocation, useNavigate } from 'react-router-dom';
import { ItemsPanel } from './ItemsPanel';
import { mapSizes, tallLayoutQuery } from './layout';
import type { MapLayout } from './layout';
import { scrollBehavior } from './motion';
import { completedPhaseCount, completedPhaseCountIn, currentPhaseOf, isPhaseComplete, placeState } from './progress';
import type { PlaceState, WorldProgress } from './progress';
import { findPlace, phaseRangeLabel, phases, placeKindLabel, placeOfPhase, places, storyChapters } from './story';
import type { Place } from './story';
import { useMediaQuery } from './useMediaQuery';
import { WorldArt } from './WorldArt';

interface WorldMapProps {
  progress: WorldProgress;
  notice: Notice | null;
  onDismissNotice: () => void;
}

const defaultZoom = 1;
const maxZoom = 1.5;
const zoomStep = 0.2;
// 全体表示の範囲は第1章の地図の大きさに固定する。地図を広げても全体表示の下限は縮めず、はみ出した分はスクロールで見る
const overviewMapSize = mapSizes.wide;
// これより小さく表示するときは、目的地ラベルを詰めた表示にする
const overviewZoomThreshold = 0.6;

const stateLabels: Record<PlaceState, string> = { done: '修了済み', current: '現在地', locked: '未解放' };
const stateMarks: Record<PlaceState, string> = { done: '✓', current: '●', locked: '🔒' };

// 地図の絵があり、座標を持つ目的地
type MappedPlace = Place & { position: NonNullable<Place['position']> };

const mappedPlaces = places.filter((place): place is MappedPlace => place.position !== null);

interface MapButtonProps {
  place: MappedPlace;
  layout: MapLayout;
  state: PlaceState;
  onClick: (opener: HTMLButtonElement) => void;
}

function MapButton({ place, layout, state, onClick }: MapButtonProps) {
  const { width, height } = mapSizes[layout];
  const style: CSSProperties = { '--map-x': `${place.position.x / width * 100}%`, '--map-y': `${place.position.y / height * 100}%` };
  const statusDescription = state === 'locked' ? '未解放。前の目的地を修了すると進めます。' : stateLabels[state];
  return (
    <button
      className={`map-destination ${state}`}
      style={style}
      onClick={(event) => onClick(event.currentTarget)}
      aria-label={`${placeKindLabel(place)} ${place.name}、${phaseRangeLabel(place)}、${statusDescription}`}
    >
      <span className="map-destination-detail">{phaseRangeLabel(place)}</span>
      <span className="map-destination-theme"><b aria-hidden="true">{stateMarks[state]}</b> {place.name}</span>
    </button>
  );
}

export default function WorldMap({ progress, notice, onDismissNotice }: WorldMapProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const placeDialogRef = useRef<HTMLDialogElement>(null);
  const itemsDialogRef = useRef<HTMLDialogElement>(null);
  const placeIndexRef = useRef<HTMLDetailsElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const fitZoomRef = useRef(0);
  const zoomCenterRef = useRef<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [zoom, setZoom] = useState(defaultZoom);
  const [fitZoom, setFitZoom] = useState(defaultZoom);
  const isDesktop = useMediaQuery('(hover: hover) and (pointer: fine)');
  const layout: MapLayout = useMediaQuery(tallLayoutQuery) ? 'tall' : 'wide';
  const { width: mapWidth, height: mapHeight } = mapSizes[layout];
  const completedCount = completedPhaseCount(progress);
  const currentPhase = currentPhaseOf(progress);
  // 全フェーズを終えたら、最後の目的地を現在地として扱う
  const currentPlace = currentPhase ? placeOfPhase(currentPhase) : places[places.length - 1];
  // 地図の絵がまだ無い目的地へ進んだら、地図の外に案内を出す
  const unmappedCurrentPlace = currentPhase && !currentPlace.position ? currentPlace : null;
  const selectedState = selected ? placeState(progress, selected) : null;

  const openPlace = (place: Place, opener?: HTMLElement) => {
    openerRef.current = opener ?? null;
    setSelected(place);
  };
  const closePlace = () => {
    placeDialogRef.current?.close();
    setSelected(null);
    openerRef.current?.focus();
  };
  const openItems = (opener: HTMLElement) => {
    openerRef.current = opener;
    itemsDialogRef.current?.showModal();
  };
  const closeItems = () => {
    itemsDialogRef.current?.close();
    openerRef.current?.focus();
  };

  const centerOnCurrent = useCallback(() => {
    const map = mapRef.current;
    const canvas = map?.querySelector<HTMLElement>('.world-canvas');
    if (!map || !canvas) return;
    // 地図の絵がまだ無い目的地にいるときは、絵のある最後の目的地を中央にする
    const { x, y } = currentPlace.position ?? mappedPlaces[mappedPlaces.length - 1].position;
    map.scrollTo({
      left: Math.max(0, x / mapWidth * canvas.clientWidth - map.clientWidth / 2),
      top: Math.max(0, y / mapHeight * canvas.clientHeight - map.clientHeight / 2),
      behavior: scrollBehavior(),
    });
  }, [currentPlace, mapWidth, mapHeight]);

  useEffect(() => {
    if (selected && placeDialogRef.current && !placeDialogRef.current.open) placeDialogRef.current.showModal();
  }, [selected]);

  useEffect(() => {
    const state = location.state as { openPlaceId?: string } | null;
    if (!state?.openPlaceId) return;
    const place = findPlace(state.openPlaceId);
    if (place) openPlace(place);
    navigate('/', { replace: true, state: null });
  }, [location.state, navigate]);

  // 開いたときと、現在地が変わったときに、現在地を画面の中央へ
  useEffect(() => {
    const frame = requestAnimationFrame(centerOnCurrent);
    return () => cancelAnimationFrame(frame);
  }, [centerOnCurrent]);

  useLayoutEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const measureFit = () => {
      const canvas = map.querySelector<HTMLElement>('.world-canvas');
      if (!canvas) return;
      const canvasZoom = Number(canvas.style.getPropertyValue('--map-zoom'));
      const baseWidth = canvas.getBoundingClientRect().width / canvasZoom;
      const baseHeight = canvas.getBoundingClientRect().height / canvasZoom;
      const overviewWidth = isDesktop ? baseWidth * overviewMapSize.width / mapWidth : baseWidth;
      const overviewHeight = isDesktop ? baseHeight * overviewMapSize.height / mapHeight : baseHeight;
      const nextFit = Math.max(0.01, Math.floor(Math.min(
        map.clientWidth / overviewWidth,
        map.clientHeight / overviewHeight,
        defaultZoom,
      ) * 0.98 * 1000) / 1000);
      const previousFit = fitZoomRef.current;
      fitZoomRef.current = nextFit;
      setFitZoom(nextFit);
      setZoom((value) => isDesktop && previousFit === 0
        ? nextFit
        : value <= previousFit + 0.001 ? nextFit : Math.max(value, nextFit));
    };
    measureFit();
    const observer = new ResizeObserver(measureFit);
    observer.observe(map);
    return () => observer.disconnect();
  }, [isDesktop, layout, mapHeight, mapWidth]);

  useLayoutEffect(() => {
    const center = zoomCenterRef.current;
    const map = mapRef.current;
    const canvas = map?.querySelector<HTMLElement>('.world-canvas');
    if (!center || !map || !canvas) return;
    zoomCenterRef.current = null;
    map.scrollTo({
      left: center.x * canvas.clientWidth - map.clientWidth / 2,
      top: center.y * canvas.clientHeight - map.clientHeight / 2,
      behavior: 'instant',
    });
  }, [zoom]);

  const dragStart = (event: PointerEvent<HTMLDivElement>) => {
    const map = mapRef.current;
    if (!map || event.pointerType === 'touch' || (event.target as HTMLElement).closest('button')) return;
    dragStartRef.current = { x: event.clientX, y: event.clientY, left: map.scrollLeft, top: map.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const dragMove = (event: PointerEvent<HTMLDivElement>) => {
    const map = mapRef.current;
    const start = dragStartRef.current;
    if (!map || !start) return;
    map.scrollLeft = start.left - (event.clientX - start.x);
    map.scrollTop = start.top - (event.clientY - start.y);
  };
  const dragEnd = () => {
    dragStartRef.current = null;
  };

  const changeZoom = (step: number) => {
    const nextZoom = Math.min(maxZoom, Math.max(fitZoom, Number((zoom + step).toFixed(3))));
    if (nextZoom === zoom) return;
    const map = mapRef.current;
    const canvas = map?.querySelector<HTMLElement>('.world-canvas');
    if (map && canvas) {
      const mapBounds = map.getBoundingClientRect();
      const canvasBounds = canvas.getBoundingClientRect();
      zoomCenterRef.current = {
        x: (mapBounds.left + map.clientWidth / 2 - canvasBounds.left) / canvasBounds.width,
        y: (mapBounds.top + map.clientHeight / 2 - canvasBounds.top) / canvasBounds.height,
      };
    }
    setZoom(nextZoom);
  };
  const resetView = () => {
    zoomCenterRef.current = null;
    setZoom(isDesktop ? fitZoom : defaultZoom);
    requestAnimationFrame(centerOnCurrent);
  };
  // 一覧を開いたら、現在地の行が見える位置まで送る
  const revealCurrentInIndex = () => {
    const index = placeIndexRef.current;
    if (!index?.open) return;
    index.querySelector<HTMLElement>('[data-current="true"]')?.scrollIntoView({ block: 'nearest' });
  };

  const canvasStyle: CSSProperties = { '--map-zoom': zoom, '--map-width': `${mapWidth}px`, '--map-aspect': `${mapWidth} / ${mapHeight}` };

  return (
    <main className="world-page">
      <header className="world-header">
        <div>
          <p>LEARNING ADVENTURE</p>
          <h1>MIND SEEKER</h1>
        </div>
        <div className="world-progress" role="group" aria-label={`全${phases.length}フェーズのうち${completedCount}フェーズを修了`}>
          <b>{completedCount}</b>
          <span>/ {phases.length} phases</span>
          <ProgressMeter ratio={completedCount / phases.length} />
        </div>
        <button onClick={(event) => openItems(event.currentTarget)}>旅人・持ち物</button>
      </header>

      <section className="world-map-shell" aria-label="学びの世界地図">
        <div
          className="world-map-scroll"
          ref={mapRef}
          onPointerDown={dragStart}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
        >
          <div className={`world-canvas ${layout}${zoom < overviewZoomThreshold ? ' overview' : ''}`} style={canvasStyle}>
            <WorldArt layout={layout} className="world-art" />
            <div className="world-labels">
              {mappedPlaces.map((place) => (
                <MapButton
                  key={place.id}
                  place={place}
                  layout={layout}
                  state={placeState(progress, place)}
                  onClick={(opener) => openPlace(place, opener)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* お知らせと次の目的地の案内は、重ならないよう1つの入れ物に縦に並べる */}
        <NoticeRegion className="map-notices" notice={notice} onDismiss={onDismissNotice} fallbackFocusSelectors={['.place-index summary']}>
          {unmappedCurrentPlace && (
            <div className="next-destination">
              <p>次の目的地：<b>{unmappedCurrentPlace.name}</b><span className="no-wrap">（第{unmappedCurrentPlace.chapterNumber}章・地図は準備中）</span></p>
              <button className="dialog-action" onClick={() => navigate('/lesson/' + unmappedCurrentPlace.id)}>学習を始める →</button>
            </div>
          )}
        </NoticeRegion>

        <div className="map-controls" role="group" aria-label="地図の表示操作">
          <details className="place-index" ref={placeIndexRef} onToggle={revealCurrentInIndex}>
            <summary>目的地一覧</summary>
            <div>
              {storyChapters.map((chapter) => (
                <section key={chapter.number} aria-label={`第${chapter.number}章 ${chapter.title}`}>
                  <h3>第{chapter.number}章 {chapter.title}</h3>
                  {chapter.places.map((place) => {
                    const state = placeState(progress, place);
                    return (
                      <button
                        key={place.id}
                        className={state}
                        data-current={state === 'current'}
                        onClick={(event) => openPlace(place, event.currentTarget)}
                      >
                        <span aria-hidden="true">{stateMarks[state]}</span> {place.name}（{phaseRangeLabel(place)}・{stateLabels[state]}）
                      </button>
                    );
                  })}
                </section>
              ))}
            </div>
          </details>
          <button onClick={() => changeZoom(zoomStep)} aria-label="地図を拡大" disabled={zoom >= maxZoom}>＋</button>
          <button onClick={() => changeZoom(-zoomStep)} aria-label="地図を縮小" disabled={zoom <= fitZoom}>－</button>
          <button onClick={resetView}>現在地</button>
        </div>
      </section>

      <dialog ref={placeDialogRef} className="world-dialog" onClose={closePlace} aria-labelledby="place-title">
        {selected && (
          <section className="world-dialog-card">
            <button className="dialog-close" onClick={closePlace} aria-label="目的地の案内を閉じる">×</button>
            <p className="card-eyebrow">CHAPTER {selected.chapterNumber}・{placeKindLabel(selected)}</p>
            <h2 id="place-title">{selected.name}</h2>
            <strong>{phaseRangeLabel(selected)}・修了 {completedPhaseCountIn(progress, selected)} / {selected.phases.length}</strong>
            <ul className="place-phases">
              {selected.phases.map((phase) => (
                <li key={phase.id}>
                  {isPhaseComplete(progress, phase.id) ? '✓' : '・'} {phase.title}（{phase.subtitle}）→<span className="item-name">「{phase.item.name}」</span>
                </li>
              ))}
            </ul>
            {selectedState === 'locked' ? (
              <p>前の目的地を修了すると、ここへ進めます。</p>
            ) : (
              <button className="dialog-action" onClick={() => navigate('/lesson/' + selected.id)}>
                {selectedState === 'done' ? '物語を読み返す' : '学習を始める'} →
              </button>
            )}
          </section>
        )}
      </dialog>

      <dialog ref={itemsDialogRef} className="world-dialog items-dialog" onClose={closeItems} aria-labelledby="items-title">
        <ItemsPanel progress={progress} onClose={closeItems} />
      </dialog>
    </main>
  );
}
