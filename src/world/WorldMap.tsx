import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NoticeRegion } from './NoticeRegion';
import type { Notice } from './NoticeRegion';
import { ProgressMeter } from './ProgressMeter';
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
  onResetProgress?: () => boolean;
}

type MappedPlace = Place & { position: NonNullable<Place['position']> };
type Journey = { from: MappedPlace; to: MappedPlace; points: string; key: string };
type LocationState = { openPlaceId?: string; journeyFromId?: string; journeyToId?: string } | null;

const defaultZoom = 1;
const overviewMapSize = mapSizes.wide;
const overviewZoomThreshold = .6;
const mobileZoomAboveOverview = .4;
const mobileLandscapeQuery = '(orientation: landscape) and (max-height: 500px)';
const journeyDuration = 2400;
const stateLabels: Record<PlaceState, string> = { done: '修了済み', current: '現在地', locked: '未解放' };
const stateMarks: Record<PlaceState, string> = { done: '✓', current: '●', locked: '🔒' };
const mappedPlaces = places.filter((place): place is MappedPlace => place.position !== null);

// 絵に描かれた道の中央を通る、第1章の3区間。地図外の章に向けた経路は作らない。
const routePoints: Record<string, string> = {
  'place-01:place-02': '300,265 435,280 500,222 600,172 850,203 945,200 1040,176 1120,217',
  'place-02:place-03': '1120,217 1225,190 1265,143 1370,188 1490,202 1590,204 1740,225 1810,255 1815,320',
  'place-03:place-04': '1815,320 1790,385 1795,435 1880,505 1900,565 1830,610 1750,638',
};

function scaleRoutePoints(points: string): string {
  const { width, height } = mapSizes.wide;
  return points.split(' ').map((point) => {
    const [x, y] = point.split(',').map(Number);
    return `${x / 1920 * width},${y / 819 * height}`;
  }).join(' ');
}

function pointOnRoute(points: string, ratio: number): { x: number; y: number } {
  const coordinates = points.split(' ').map((point) => point.split(',').map(Number) as [number, number]);
  const lengths = coordinates.slice(1).map(([x, y], index) => Math.hypot(x - coordinates[index][0], y - coordinates[index][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = total * ratio;
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index]) {
      const [x1, y1] = coordinates[index];
      const [x2, y2] = coordinates[index + 1];
      const segmentRatio = lengths[index] === 0 ? 0 : remaining / lengths[index];
      return { x: x1 + (x2 - x1) * segmentRatio, y: y1 + (y2 - y1) * segmentRatio };
    }
    remaining -= lengths[index];
  }
  const [x, y] = coordinates[coordinates.length - 1];
  return { x, y };
}

function routeFor(from: Place, to: Place): Journey | null {
  if (!from.position || !to.position) return null;
  const key = `${from.id}:${to.id}`;
  const points = routePoints[key];
  return points ? { from: from as MappedPlace, to: to as MappedPlace, points: scaleRoutePoints(points), key } : null;
}

interface MapButtonProps {
  place: MappedPlace;
  layout: MapLayout;
  state: PlaceState;
  arrived: boolean;
  hidden: boolean;
  onClick: (opener: HTMLButtonElement) => void;
}

function MapButton({ place, layout, state, arrived, hidden, onClick }: MapButtonProps) {
  const { width, height } = mapSizes[layout];
  const style: CSSProperties = { '--map-x': `${place.position.x / width * 100}%`, '--map-y': `${place.position.y / height * 100}%` };
  const statusDescription = state === 'locked' ? '未解放。前の目的地を修了すると進めます。' : stateLabels[state];
  const visible = state !== 'locked';
  return (
    <button
      className={`map-destination ${state}${arrived ? ' journey-arrived' : ''}${hidden ? ' journey-hidden' : ''}`}
      style={style}
      onClick={(event) => onClick(event.currentTarget)}
      aria-label={`${placeKindLabel(place)} ${place.name}、${phaseRangeLabel(place)}、${statusDescription}`}
      tabIndex={visible && !hidden ? undefined : -1}
      aria-hidden={hidden || undefined}
    >
      <span className="map-destination-detail">{phaseRangeLabel(place)}</span>
      <span className="map-destination-theme"><b aria-hidden="true">{state === 'current' ? '▼' : stateMarks[state]}</b> {place.name}</span>
    </button>
  );
}

function JourneyLine({ journey }: { journey: Journey }) {
  const { width, height } = mapSizes.wide;
  const motionPath = `M${journey.points.split(' ').join(' L')}`;
  return (
    <svg className="map-journey-line" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label={`${journey.to.name}への道筋`}>
      <polyline className="map-journey-glow" points={journey.points} pathLength="1" />
      <polyline className="map-journey-stroke" points={journey.points} pathLength="1" />
      <circle className="map-journey-point" r="20">
        <animateMotion dur="2.4s" path={motionPath} fill="freeze" />
      </circle>
    </svg>
  );
}

export default function WorldMap({ progress, notice, onDismissNotice, onResetProgress }: WorldMapProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const placeDialogRef = useRef<HTMLDialogElement>(null);
  const itemsDialogRef = useRef<HTMLDialogElement>(null);
  const placeIndexRef = useRef<HTMLDetailsElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [zoom, setZoom] = useState(defaultZoom);
  const [itemsPanelKey, setItemsPanelKey] = useState(0);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [journeyArrived, setJourneyArrived] = useState(false);
  const isDesktop = useMediaQuery('(hover: hover) and (pointer: fine)');
  const isMobilePortrait = useMediaQuery(tallLayoutQuery);
  const isMobileLandscape = useMediaQuery(mobileLandscapeQuery);
  const isMobile = isMobilePortrait || isMobileLandscape;
  const layout: MapLayout = isMobilePortrait ? 'tall' : 'wide';
  const { width: mapWidth, height: mapHeight } = mapSizes[layout];
  const completedCount = completedPhaseCount(progress);
  const currentPhase = currentPhaseOf(progress);
  const currentPlace = currentPhase ? placeOfPhase(currentPhase) : places[places.length - 1];
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
    setItemsPanelKey((key) => key + 1);
    openerRef.current?.focus();
  };

  const centerOn = useCallback((place: MappedPlace, behavior: ScrollBehavior = scrollBehavior()) => {
    const map = mapRef.current;
    const canvas = map?.querySelector<HTMLElement>('.world-canvas');
    if (!map || !canvas) return;
    map.scrollTo({
      left: Math.max(0, place.position.x / mapWidth * canvas.clientWidth - map.clientWidth / 2),
      top: Math.max(0, place.position.y / mapHeight * canvas.clientHeight - map.clientHeight / 2),
      behavior,
    });
  }, [mapHeight, mapWidth]);
  const centerOnCurrent = useCallback(() => {
    const place = currentPlace.position ? currentPlace as MappedPlace : mappedPlaces[mappedPlaces.length - 1];
    centerOn(place);
  }, [centerOn, currentPlace]);

  useEffect(() => {
    if (selected && placeDialogRef.current && !placeDialogRef.current.open) placeDialogRef.current.showModal();
  }, [selected]);

  useEffect(() => {
    const state = location.state as LocationState;
    if (!state) return;
    if (state.journeyFromId && state.journeyToId) {
      const from = findPlace(state.journeyFromId);
      const to = findPlace(state.journeyToId);
      const nextJourney = from && to ? routeFor(from, to) : null;
      if (nextJourney && to && placeState(progress, to) !== 'locked') {
        setJourney(nextJourney);
        setJourneyArrived(false);
      }
    } else if (state.openPlaceId) {
      const place = findPlace(state.openPlaceId);
      if (place) openPlace(place);
    }
    navigate('/', { replace: true, state: null });
  }, [location.state, navigate, progress]);

  useEffect(() => {
    if (journey) return;
    const frame = requestAnimationFrame(centerOnCurrent);
    return () => cancelAnimationFrame(frame);
  }, [centerOnCurrent, isMobileLandscape, journey, layout, zoom]);

  useEffect(() => {
    if (!journey) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      centerOn(journey.to, 'auto');
      setJourneyArrived(true);
      return;
    }
    centerOn(journey.from, 'auto');
    let frame = 0;
    const startedAt = performance.now();
    const followRoute = (now: number) => {
      const map = mapRef.current;
      const canvas = map?.querySelector<HTMLElement>('.world-canvas');
      if (!map || !canvas) {
        frame = requestAnimationFrame(followRoute);
        return;
      }
      const progressRatio = Math.min(1, (now - startedAt) / journeyDuration);
      const { x, y } = pointOnRoute(journey.points, progressRatio);
      if (isMobile) {
        map.scrollLeft = Math.max(0, x / mapWidth * canvas.clientWidth - map.clientWidth / 2);
        map.scrollTop = Math.max(0, y / mapHeight * canvas.clientHeight - map.clientHeight / 2);
      }
      if (progressRatio < 1) {
        frame = requestAnimationFrame(followRoute);
      } else {
        setJourneyArrived(true);
      }
    };
    frame = requestAnimationFrame(followRoute);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [centerOn, isMobile, journey, mapHeight, mapWidth]);

  useLayoutEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const measureFit = () => {
      const canvas = map.querySelector<HTMLElement>('.world-canvas');
      if (!canvas) return;
      const canvasZoom = Number(canvas.style.getPropertyValue('--map-zoom')) || 1;
      const baseWidth = canvas.getBoundingClientRect().width / canvasZoom;
      const baseHeight = canvas.getBoundingClientRect().height / canvasZoom;
      const overviewWidth = isDesktop ? baseWidth * overviewMapSize.width / mapWidth : baseWidth;
      const overviewHeight = isDesktop ? baseHeight * overviewMapSize.height / mapHeight : baseHeight;
      const nextFit = Math.max(.01, Math.floor(Math.min(map.clientWidth / overviewWidth, map.clientHeight / overviewHeight, defaultZoom) * .98 * 1000) / 1000);
      const mobileZoom = Math.min(defaultZoom, Math.max(nextFit + mobileZoomAboveOverview, map.clientHeight / baseHeight));
      setZoom(isMobile ? mobileZoom : nextFit);
    };
    measureFit();
    const observer = new ResizeObserver(measureFit);
    observer.observe(map);
    return () => observer.disconnect();
  }, [isDesktop, isMobile, layout, mapHeight, mapWidth]);

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
  const dragEnd = () => { dragStartRef.current = null; };
  const revealCurrentInIndex = () => {
    const index = placeIndexRef.current;
    if (index?.open) index.querySelector<HTMLElement>('[data-current="true"]')?.scrollIntoView({ block: 'nearest' });
  };
  const canvasStyle: CSSProperties = { '--map-zoom': zoom, '--map-width': `${mapWidth}px`, '--map-aspect': `${mapWidth} / ${mapHeight}` };

  return (
    <main className="world-page">
      <header className="world-header">
        <div><p>LEARNING ADVENTURE</p><h1>MIND SEEKER</h1></div>
        <div className="world-progress" role="group" aria-label={`全${phases.length}フェーズのうち${completedCount}フェーズを修了`}><b>{completedCount}</b><span>/ {phases.length} phases</span><ProgressMeter ratio={completedCount / phases.length} /></div>
        <button onClick={(event) => openItems(event.currentTarget)}>旅人・持ち物</button>
      </header>
      <section className="world-map-shell" aria-label="学びの世界地図">
        <div className="world-map-scroll" ref={mapRef} onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={dragEnd} onPointerCancel={dragEnd}>
          <div className={`world-canvas ${layout}${zoom < overviewZoomThreshold ? ' overview' : ''}`} style={canvasStyle}>
            <WorldArt layout={layout} className="world-art" />
            {journey && !journeyArrived && <JourneyLine journey={journey} />}
            <div className="world-labels">
              {mappedPlaces.map((place) => <MapButton key={place.id} place={place} layout={layout} state={placeState(progress, place)} arrived={journeyArrived && journey?.to.id === place.id} hidden={journey?.to.id === place.id && !journeyArrived} onClick={(opener) => openPlace(place, opener)} />)}
            </div>
          </div>
        </div>
        {journey && !journeyArrived && <button className="journey-skip" onClick={() => { centerOn(journey.to, 'auto'); setJourneyArrived(true); }}>演出をスキップ</button>}
        <NoticeRegion className="map-notices" notice={notice} onDismiss={onDismissNotice} fallbackFocusSelectors={['.place-index summary']}>
          {unmappedCurrentPlace && <div className="next-destination"><p>次の目的地：<b>{unmappedCurrentPlace.name}</b><span className="no-wrap">（第{unmappedCurrentPlace.chapterNumber}章・地図は準備中）</span></p><button className="dialog-action" onClick={() => navigate('/lesson/' + unmappedCurrentPlace.id)}>学習を始める →</button></div>}
        </NoticeRegion>
        <div className="map-controls" role="group" aria-label="地図の表示操作">
          <details className="place-index" ref={placeIndexRef} onToggle={revealCurrentInIndex}><summary>目的地一覧</summary><div>{storyChapters.map((chapter) => <section key={chapter.number} aria-label={`第${chapter.number}章 ${chapter.title}`}><h3>第{chapter.number}章 {chapter.title}</h3>{chapter.places.map((place) => { const state = placeState(progress, place); return <button key={place.id} className={state} data-current={state === 'current'} onClick={(event) => openPlace(place, event.currentTarget)}><span aria-hidden="true">{stateMarks[state]}</span> {place.name}（{phaseRangeLabel(place)}・{stateLabels[state]}）</button>; })}</section>)}</div></details>
          <button onClick={centerOnCurrent}>現在地</button>
        </div>
      </section>
      <dialog ref={placeDialogRef} className="world-dialog" onClose={closePlace} aria-labelledby="place-title">
        {selected && <section className="world-dialog-card"><button className="dialog-close" onClick={closePlace} aria-label="目的地の案内を閉じる">×</button><p className="card-eyebrow">CHAPTER {selected.chapterNumber}・{placeKindLabel(selected)}</p><h2 id="place-title">{selected.name}</h2><strong>{phaseRangeLabel(selected)}・修了 {completedPhaseCountIn(progress, selected)} / {selected.phases.length}</strong><ul className="place-phases">{selected.phases.map((phase) => <li key={phase.id}>{isPhaseComplete(progress, phase.id) ? '✓' : '・'} {phase.title}（{phase.subtitle}）→<span className="item-name">「{phase.item.name}」</span></li>)}</ul>{selectedState === 'locked' ? <p>前の目的地を修了すると、ここへ進めます。</p> : <button className="dialog-action" onClick={() => navigate('/lesson/' + selected.id)}>{selectedState === 'done' ? '物語を読み返す' : '学習を始める'} →</button>}</section>}
      </dialog>
      <dialog ref={itemsDialogRef} className="world-dialog items-dialog" onClose={closeItems} aria-labelledby="items-title"><ItemsPanel key={itemsPanelKey} progress={progress} onClose={closeItems} onResetProgress={onResetProgress} /></dialog>
    </main>
  );
}
