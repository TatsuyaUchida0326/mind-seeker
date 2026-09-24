import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import mapImage from './assets/map.png';
import { stages } from './stages';
import bgmAudio from './assets/adventure-bgm.mp3';
import { AUDIO_VOLUME, RETRY_INTERVAL, MAX_RETRY_COUNT } from './audioSettings';
import swordIcon from './assets/sword.png';
import armorIcon from './assets/armor.png';
import shieldIcon from './assets/shield.png';
import helmetIcon from './assets/helmet.png'; 
import horseIcon from './assets/horse.png'; 
import fireIcon from './assets/fire.png';
import keyIcon from './assets/key.png'; 
import bookIcon from './assets/book.png';
import waterIcon from './assets/water.png';
import staffIcon from './assets/staff.png';
import mapItemIcon from './assets/map-item.png'; 
import clawIcon from './assets/claw.png';
import thunderIcon from './assets/thunder.png'; 
import hammerIcon from './assets/hammer.png';

// カスタムアイテムの型定義
type ItemType = string | { type: 'image'; src: string; alt: string };

interface StatusData {
  label: string;
  value: number;
  color: string;
}

interface ProgressData {
  currentLevel: number;
  maxLevel: number;
  experience: number;
  nextLevelExp: number;
}

function App({ currentStage }: { currentStage: number }) {
  const navigate = useNavigate();
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  // 進捗データの状態を設定
  const [progress] = useState<ProgressData>({
    currentLevel: Math.floor(currentStage / 3) + 1,
    maxLevel: Math.ceil(stages.length / 3),
    experience: (currentStage % 3) * 33,
    nextLevelExp: 100
  });

  // ステータスデータの初期値を設定
  const [statusBars] = useState<StatusData[]>([
    { label: "体力", value: 75, color: "vitality" },
    { label: "精神力", value: 66, color: "mental" },
    { label: "行動力", value: 79, color: "action" },
    { label: "協調性", value: 68, color: "cooperation" },
    { label: "知識", value: 72, color: "knowledge" },
    { label: "継続力", value: 80, color: "persistence" }
  ]);

  // レーダーチャートの頂点を計算する関数
  const calculatePolygonPoints = (values: number[], size: number) => {
    const points = [];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.8;

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const value = values[i] / 100;
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  };

  // コンポーネントマウント時にBGMを初期化
  useEffect(() => {
    const initAudio = async () => {
      try {
        const audio = new Audio(bgmAudio);
        audio.loop = true;
        audio.volume = AUDIO_VOLUME;
        await audio.load();
        bgmRef.current = audio;
        setIsBgmPlaying(true);
      } catch (error) {
        console.error('BGMの初期化に失敗しました:', error);
      }
    };

    initAudio();

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  // BGMの再生制御
  useEffect(() => {
    if (!bgmRef.current || !isBgmPlaying) return;

    let retryCount = 0;
    let isUnmounted = false;

    const attemptPlay = async () => {
      if (isUnmounted || !bgmRef.current) return;

      try {
        await bgmRef.current.play();
        console.log('BGM再生開始');
      } catch (error) {
        if (!isUnmounted && retryCount < MAX_RETRY_COUNT) {
          console.warn(`BGM再生の試行に失敗しました。再試行 ${retryCount + 1}/${MAX_RETRY_COUNT}`);
          retryCount++;
          setTimeout(attemptPlay, RETRY_INTERVAL);
        }
      }
    };

    attemptPlay();

    return () => {
      isUnmounted = true;
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    };
  }, [isBgmPlaying]);

  const toggleBgm = () => {
    if (!bgmRef.current) return;
    
    if (isBgmPlaying) {
      bgmRef.current.pause();
    } else {
      bgmRef.current.play().catch((error) => {
        console.warn('BGM再生の再開に失敗しました:', error);
      });
    }
    setIsBgmPlaying(!isBgmPlaying);
  };

  // インベントリアイテムのデータを定義
  const getItemIcon = (index: number): ItemType => {
    const items: ItemType[] = [
      { type: 'image', src: swordIcon, alt: '剣' },
      { type: 'image', src: armorIcon, alt: '鎧' },
      { type: 'image', src: shieldIcon, alt: '盾' },
      { type: 'image', src: helmetIcon, alt: '兜' },
      { type: 'image', src: horseIcon, alt: '馬' }, 
      { type: 'image', src: fireIcon, alt: '炎' },
      { type: 'image', src: keyIcon, alt: '鍵' }, 
      { type: 'image', src: bookIcon, alt: '本' }, 
      { type: 'image', src: waterIcon, alt: '水' },
      { type: 'image', src: staffIcon, alt: '杖' },
      { type: 'image', src: mapItemIcon, alt: '地図' },
      { type: 'image', src: clawIcon, alt: '爪' },
      { type: 'image', src: thunderIcon, alt: '雷' }, 
      { type: 'image', src: hammerIcon, alt: 'ハンマー' },
      
      '🔮', '📚', '🗝️', '💎', '🏹', '🪄', '⚡',
      '🌟', '🎭', '🎪', '🌈', '🌙', '☀️', '⭐', '🎨', '🎼', '🎮',
      '🎲', '🎯', '🎪', '🎭', '🎨', '🎼', '🎮', '🎲', '🎯', '👑'
    ];
    return items[index] || '❓';
  };

  return (
    <div className="map-wrapper">
      {/* インベントリを配置 */}
      <div className="inventory-container">
        <div className="inventory-title">取得アイテム</div>
        <div className="inventory-grid">
          {Array(30).fill(null).map((_, index) => (
            <div 
              key={index} 
              className={`inventory-slot ${index < currentStage ? 'obtained' : ''}`}
            >
              {index < currentStage && (
                <div className="item-icon">
                  {(() => {
                    const icon = getItemIcon(index);
                    if (typeof icon === 'string') {
                      return icon;
                    }
                    return (
                      <img 
                        src={icon.src}
                        alt={icon.alt}
                        className={`custom-item-icon ${
                          icon.alt === '剣' ? 'sword-icon' : 
                          icon.alt === '鎧' ? 'armor-icon' :
                          icon.alt === '盾' ? 'shield-icon' :
                          icon.alt === '兜' ? 'helmet-icon' :
                          icon.alt === '馬' ? 'horse-icon' :
                          icon.alt === '炎' ? 'fire-icon' :
                          icon.alt === '鍵' ? 'key-icon' :
                          icon.alt === '本' ? 'book-icon' :
                          icon.alt === '水' ? 'water-icon' :
                          icon.alt === '杖' ? 'staff-icon' :
                          icon.alt === '地図' ? 'map-item-icon' :
                          icon.alt === '爪' ? 'claw-icon' :
                          icon.alt === '雷' ? 'thunder-icon' :
                          icon.alt === 'ハンマー' ? 'hammer-icon' : ''
                        }`}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 進捗表示エリア */}
      <div className="progress-container">
        <div className="level-info">
          <span className="level-label">Lv. {progress.currentLevel}</span>
          <span className="level-max">/ {progress.maxLevel}</span>
        </div>
        <div className="exp-bar-container">
          <div className="exp-bar-bg">
            <div 
              className="exp-bar-fill"
              style={{ width: `${progress.experience}%` }}
            ></div>
          </div>
          <span className="exp-text">{progress.experience}%</span>
        </div>
        <div className="progress-title">冒険の進捗</div>
      </div>

      {/* ステータス表示エリア */}
      <div className="stats-container">
        {/* ステータスバー */}
        <div className="status-bars">
          {statusBars.map((status, index) => (
            <div key={index} className="status-item">
              <span className="status-label">{status.label}</span>
              <div className="status-bar-bg">
                <div 
                  className={`status-bar-fill ${status.color}`}
                  style={{ width: `${status.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* レーダーチャート */}
        <div className="radar-chart">
          <svg className="radar-svg" viewBox="0 0 100 100">
            <polygon 
              className="radar-bg"
              points={calculatePolygonPoints([100, 100, 100, 100, 100, 100], 100)}
            />
            <polygon 
              className="radar-data"
              points={calculatePolygonPoints(
                statusBars.map(status => status.value),
                100
              )}
            />
          </svg>
          <div className="radar-labels radar-label-vitality">体力</div>
          <div className="radar-labels radar-label-mental">精神力</div>
          <div className="radar-labels radar-label-action">行動力</div>
          <div className="radar-labels radar-label-cooperation">協調性</div>
          <div className="radar-labels radar-label-knowledge">知識</div>
          <div className="radar-labels radar-label-persistence">継続力</div>
        </div>
      </div>

      {/* 地図 */}
      <svg viewBox="0 0 1920 1080" className="map-svg">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <image href={mapImage} x="0" y="0" width="1920" height="1080" />

        {stages.map((stage, index) => {
          if (index > currentStage) return null;

          const isCurrent = index === currentStage;
          const isClickable = index <= currentStage;

          const charLength = stage.name.length;
          const labelWidth = Math.max(80, charLength * 16 + 20);
          const labelHeight = 22;
          const xOffset = -(labelWidth / 2);
          const yOffset = -(labelHeight / 2);

          return (
            <g
              key={stage.name}
              transform={`translate(${stage.x}, ${stage.y})`}
              onClick={() => {
                if (isClickable) {
                  navigate(`/lesson/${stage.name}`);
                }
              }}
              style={{
                cursor: isClickable ? 'pointer' : 'default',
                opacity: isClickable ? 1 : 0.4,
              }}
            >
              <g className={isCurrent ? 'jump-group' : ''}>
                <foreignObject
                  x={xOffset}
                  y={yOffset}
                  width={labelWidth}
                  height={labelHeight}
                >
                  <div className="label-frame">
                    <span className="label-text">{stage.name}</span>
                  </div>
                </foreignObject>
              </g>
            </g>
          );
        })}
      </svg>

      {/* BGMコントロール */}
      <div className="bgm-toggle">
        <button className="bgm-button" onClick={toggleBgm}>
          {isBgmPlaying ? '🔇 BGM OFF' : '🔊 BGM ON'}
        </button>
      </div>
    </div>
  );
}

export default App;
