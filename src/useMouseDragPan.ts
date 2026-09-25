import { useEffect, type RefObject } from 'react';

// これ以上動いたら「ドラッグ」とみなす。これ未満ならクリック（街名ラベルを押す）として扱う
const DRAG_THRESHOLD_PX = 4;

// マウスのドラッグでスクロール領域を動かす。タッチは端末標準のスクロールに任せるため対象外。
// dragIgnoredSelector に当たる要素（地図上のパネルなど）から始めたドラッグは動かさない
export function useMouseDragPan(scrollAreaRef: RefObject<HTMLElement | null>, dragIgnoredSelector: string) {
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    let dragStartState: { x: number; y: number; scrollLeft: number; scrollTop: number } | null = null;
    let didDrag = false;

    const handlePointerDown = (event: PointerEvent) => {
      didDrag = false;
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest(dragIgnoredSelector)) return;
      dragStartState = { x: event.clientX, y: event.clientY, scrollLeft: scrollArea.scrollLeft, scrollTop: scrollArea.scrollTop };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStartState) return;
      const dx = event.clientX - dragStartState.x;
      const dy = event.clientY - dragStartState.y;
      if (!didDrag && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      didDrag = true;
      scrollArea.classList.add('is-dragging');
      scrollArea.scrollLeft = dragStartState.scrollLeft - dx;
      scrollArea.scrollTop = dragStartState.scrollTop - dy;
    };

    const handlePointerUp = () => {
      dragStartState = null;
      scrollArea.classList.remove('is-dragging');
    };

    const cancelDrag = () => {
      dragStartState = null;
      didDrag = false;
      scrollArea.classList.remove('is-dragging');
    };

    // ドラッグの終わりに指が離れた位置の街名ラベルが押されないよう、直後のクリックを1回だけ打ち消す
    const handleClickCapture = (event: MouseEvent) => {
      if (!didDrag) return;
      event.stopPropagation();
      event.preventDefault();
      didDrag = false;
    };

    scrollArea.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', cancelDrag);
    window.addEventListener('blur', cancelDrag);
    scrollArea.addEventListener('click', handleClickCapture, true);
    return () => {
      scrollArea.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', cancelDrag);
      window.removeEventListener('blur', cancelDrag);
      scrollArea.removeEventListener('click', handleClickCapture, true);
    };
  }, [scrollAreaRef, dragIgnoredSelector]);
}
