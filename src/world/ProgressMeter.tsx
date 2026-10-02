interface ProgressMeterProps {
  // 0〜1 の割合
  ratio: number;
  className?: string;
}

export function ProgressMeter({ ratio, className }: ProgressMeterProps) {
  return <div className={['progress-meter', className].filter(Boolean).join(' ')}><i style={{ '--progress': `${ratio * 100}%` }} /></div>;
}
