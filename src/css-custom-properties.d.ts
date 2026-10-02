import 'react';

// style 属性で CSS 変数（--map-x など）を型の検査を外さずに渡せるようにする
declare module 'react' {
  interface CSSProperties {
    [customProperty: `--${string}`]: string | number | undefined;
  }
}
