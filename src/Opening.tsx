import { useState, useRef, useEffect } from 'react';
import openingVideo from './assets/opening.mp4';
import openingBg from './assets/opening-bg.jpg';
import openingBgm from './assets/opening-bgm.mp3';
import { AUDIO_VOLUME, RETRY_INTERVAL, MAX_RETRY_COUNT } from './audioSettings';

interface OpeningProps {
  onFinish: () => void;
}

function Opening({ onFinish }: OpeningProps) {
  const [isStarted, setIsStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  useEffect(() => {
    const initBgm = async () => {
      try {
        const audio = new Audio(openingBgm);
        audio.loop = true;
        audio.volume = AUDIO_VOLUME;
        await audio.load();
        bgmRef.current = audio;
        setIsBgmPlaying(true);
      } catch (error) {
        console.error('Opening BGMの初期化に失敗しました:', error);
      }
    };

    if (!isStarted) {
      initBgm();
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, [isStarted]);

  useEffect(() => {
    if (!bgmRef.current || !isBgmPlaying) return;

    let retryCount = 0;
    let isUnmounted = false;

    const attemptPlay = async () => {
      if (isUnmounted || !bgmRef.current) return;

      try {
        await bgmRef.current.play();
        console.log('Opening BGM再生開始');
      } catch {
        if (!isUnmounted && retryCount < MAX_RETRY_COUNT) {
          console.warn(`Opening BGM再生の試行に失敗しました。再試行 ${retryCount + 1}/${MAX_RETRY_COUNT}`);
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

  const handleStart = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
    }
    setIsStarted(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.volume = AUDIO_VOLUME;
        videoRef.current.play();
      }
    }, 100);
  };

  const handleFinish = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
    }
    onFinish();
  };

  return (
    <div className="video-fullscreen">
      {isStarted ? (
        <div className="opening-video-stage">
          {/* playsInline が無いと iPhone は OS の全画面プレイヤーで再生し、スキップボタンが見えなくなる */}
          <video
            ref={videoRef}
            src={openingVideo}
            controls={false}
            playsInline
            onEnded={handleFinish}
            className="opening-video"
          />
        </div>
      ) : (
        <div className="opening-title-stage">
          <div
            className="opening-background"
            style={{
              backgroundImage: `url(${openingBg})`,
            }}
          />

          <div className="opening-title-shade" />

          <div className="opening-title-content">
            <div className="title-shine-container">
              <h1 className="title-text">
                MIND SEEKER
              </h1>
            </div>

            <button
              className="start-button"
              onClick={handleStart}
            >
              ▶️ Start Adventure
            </button>
          </div>
        </div>
      )}
      {isStarted && (
        <button
          className="rpg-skip-button"
          onClick={handleFinish}
        >
          <span style={{ fontSize: '1.2em' }}>⏭</span>
          <span>スキップしてMapへ</span>
        </button>
      )}
    </div>
  );
}

export default Opening;
