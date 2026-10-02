import { useEffect, useState } from 'react';
import type { CharacterStage } from './characterStages';
import { useMediaQuery } from './useMediaQuery';

export type PromotionPreviewTimeMs = 0 | 500 | 1000 | 1500 | 2000;

interface CharacterPromotionProps {
  beforeStage: CharacterStage;
  afterStage: CharacterStage;
  previewTimeMs?: PromotionPreviewTimeMs;
}

type ImageLoadState = 'loading' | 'ready' | 'failed';

function preloadImage(imageSource: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      image.decode().catch(() => undefined).finally(resolve);
    };
    image.onerror = () => reject(new Error('character image failed to load'));
    image.src = imageSource;
  });
}

export function CharacterPromotion({ beforeStage, afterStage, previewTimeMs }: CharacterPromotionProps) {
  const [imageLoadState, setImageLoadState] = useState<ImageLoadState>('loading');
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null);
  const imageKey = `${beforeStage.imageSource}\u0000${afterStage.imageSource}`;
  const currentImageLoadState = loadedImageKey === imageKey ? imageLoadState : 'loading';
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const shouldAnimate = currentImageLoadState === 'ready' && !prefersReducedMotion && beforeStage.id !== afterStage.id;
  const promotionClassName = `character-promotion character-promotion-active${previewTimeMs === undefined ? '' : ` character-promotion-preview-${previewTimeMs}`}`;

  useEffect(() => {
    let isMounted = true;
    setImageLoadState('loading');
    setLoadedImageKey(null);

    Promise.all([preloadImage(beforeStage.imageSource), preloadImage(afterStage.imageSource)])
      .then(() => {
        if (!isMounted) return;
        setLoadedImageKey(imageKey);
        setImageLoadState('ready');
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadedImageKey(imageKey);
        setImageLoadState('failed');
      });

    return () => { isMounted = false; };
  }, [afterStage.imageSource, beforeStage.imageSource, imageKey]);

  if (currentImageLoadState === 'failed') {
    return <p className="character-promotion-error" role="status">新しい姿の画像を読み込めませんでした。進行はそのまま続けられます。</p>;
  }

  if (currentImageLoadState === 'loading') {
    return <div className="character-promotion character-promotion-loading" aria-live="polite"><p>新しい姿を整えています…</p></div>;
  }

  if (!shouldAnimate) {
    return (
      <div className="character-promotion character-promotion-static" aria-live="polite">
        <img src={afterStage.imageSource} alt={afterStage.name} />
      </div>
    );
  }

  return (
    <div className={promotionClassName} aria-live="polite">
      <img className="character-promotion-before" src={beforeStage.imageSource} alt="" />
      <span className="character-promotion-aura" aria-hidden="true" />
      <img className="character-promotion-after" src={afterStage.imageSource} alt={afterStage.name} />
      <p className="character-promotion-label">{afterStage.name}へ昇格</p>
    </div>
  );
}
