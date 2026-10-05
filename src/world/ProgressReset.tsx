import { useEffect, useRef, useState } from 'react';

type ResetStep = 'idle' | 'confirming' | 'done' | 'failed';

interface ProgressResetProps {
  // 保存できたら true を返す
  onReset: () => boolean;
}

// テスト運転用。修了したフェーズをまとめて消し、主人公を最初の姿に戻す
export function ProgressReset({ onReset }: ProgressResetProps) {
  const [step, setStep] = useState<ResetStep>('idle');
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);
  const hasChangedStepRef = useRef(false);

  // 表示が切り替わったら、次に操作するところへフォーカスを移す（開いた直後は動かさない）。
  // 結果の文はフォーカスで読み上げられるため、role="status" などは重ねない
  useEffect(() => {
    if (!hasChangedStepRef.current) return;
    if (step === 'confirming') cancelButtonRef.current?.focus();
    else if (step === 'idle') startButtonRef.current?.focus();
    else resultRef.current?.focus();
  }, [step]);

  const goToStep = (next: ResetStep) => {
    hasChangedStepRef.current = true;
    setStep(next);
  };

  return (
    <section className="progress-reset" aria-labelledby="progress-reset-title">
      <h3 id="progress-reset-title">テスト運転用</h3>
      {step === 'confirming' ? (
        <>
          <p id="progress-reset-warning">修了したフェーズと持ち物をすべて消し、旅立ち前の姿に戻します。元には戻せません。</p>
          <div className="progress-reset-actions">
            <button ref={cancelButtonRef} aria-describedby="progress-reset-warning" onClick={() => goToStep('idle')}>やめる</button>
            <button className="progress-reset-confirm" aria-describedby="progress-reset-warning" onClick={() => goToStep(onReset() ? 'done' : 'failed')}>すべて消して最初に戻す</button>
          </div>
        </>
      ) : (
        <>
          {step === 'done' && <p ref={resultRef} tabIndex={-1}>最初の状態に戻しました。</p>}
          {step === 'failed' && <p ref={resultRef} tabIndex={-1}>最初に戻せませんでした。パネルを閉じると、地図に理由が出ています。</p>}
          <button ref={startButtonRef} onClick={() => goToStep('confirming')}>最初からやり直す</button>
        </>
      )}
    </section>
  );
}
