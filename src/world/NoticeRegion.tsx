import { useEffect, useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';

// 画面に出すお知らせ。error は操作できなかったこと、info は知らせるだけのこと
export interface Notice {
  kind: 'error' | 'info';
  text: string;
}

interface NoticeRegionProps {
  notice: Notice | null;
  onDismiss: () => void;
  className?: string;
  // 閉じたあと、同じ入れ物に押せるものが残っていないときにフォーカスを移す先（先に書いたものから探す）
  fallbackFocusSelectors: string[];
  // お知らせと同じ入れ物に並べるもの（地図の「次の目的地」など）
  children?: ReactNode;
}

// 閉じたあと、ダブルクリックの2回目を、お知らせが消えた場所に現れた要素へ当てないための間（ミリ秒）
const dismissGuardMs = 500;

function isInside(rect: DOMRect, event: globalThis.MouseEvent): boolean {
  return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
}

// 読み上げに確実に伝わるよう、status と alert の領域を常に置き、中身だけを出し入れする
export function NoticeRegion({ notice, onDismiss, className, fallbackFocusSelectors, children }: NoticeRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const releaseGuardRef = useRef<(() => void) | null>(null);

  useEffect(() => () => releaseGuardRef.current?.(), []);

  // 消えたお知らせの範囲に落ちた操作だけを、画面全体で少しの間止める。
  // 入れ物の中で止めるだけでは、下の地図など入れ物の外へ抜けたクリックを止められない。
  // 押した瞬間（mousedown）も止めないと、クリックは止まってもフォーカスが下の要素へ移る
  const guardDismissedArea = (rect: DOMRect) => {
    releaseGuardRef.current?.();
    const guardedEvents = ['pointerdown', 'mousedown', 'click'] as const;
    const swallow = (event: globalThis.MouseEvent) => {
      if (!isInside(rect, event)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    guardedEvents.forEach((type) => window.addEventListener(type, swallow, true));
    const timer = window.setTimeout(() => releaseGuardRef.current?.(), dismissGuardMs);
    releaseGuardRef.current = () => {
      guardedEvents.forEach((type) => window.removeEventListener(type, swallow, true));
      window.clearTimeout(timer);
      releaseGuardRef.current = null;
    };
  };

  // ×のボタンは閉じると消えるため、フォーカスが行き場を失わないよう残る要素へ移す
  const moveFocusAfterDismiss = () => {
    window.setTimeout(() => {
      const remaining = regionRef.current?.querySelector<HTMLElement>('button');
      const fallback = fallbackFocusSelectors
        .map((selector) => document.querySelector<HTMLElement>(selector))
        .find((element) => element !== null);
      (remaining ?? fallback)?.focus();
    }, 0);
  };

  const dismiss = (event: MouseEvent<HTMLButtonElement>) => {
    const noticeElement = event.currentTarget.closest('.notice');
    if (noticeElement) guardDismissedArea(noticeElement.getBoundingClientRect());
    onDismiss();
    moveFocusAfterDismiss();
  };

  const regionFor = (kind: Notice['kind']) => {
    const noticeOfKind = notice?.kind === kind ? notice : null;
    return (
      <div className={`notice ${kind}${noticeOfKind ? '' : ' empty'}`} role={kind === 'error' ? 'alert' : 'status'}>
        {noticeOfKind && (
          <>
            <span>{noticeOfKind.text}</span>
            <button onClick={dismiss} aria-label="お知らせを閉じる">×</button>
          </>
        )}
      </div>
    );
  };

  return (
    <div ref={regionRef} className={['notice-region', className].filter(Boolean).join(' ')}>
      {regionFor('error')}
      {regionFor('info')}
      {children}
    </div>
  );
}
