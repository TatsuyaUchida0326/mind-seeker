// OS の「動きを減らす」設定の利用者には、スクロールを動かさずに切り替える
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
