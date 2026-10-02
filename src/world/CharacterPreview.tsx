import { useState } from 'react';
import { AvatarArt } from './AvatarArt';
import { characterStages } from './characterStages';
import { CharacterPromotion } from './CharacterPromotion';
import type { PromotionPreviewTimeMs } from './CharacterPromotion';

const previewTimeOptions = [0, 500, 1000, 1500, 2000] as const satisfies readonly PromotionPreviewTimeMs[];

export function CharacterPreview() {
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [replayCount, setReplayCount] = useState(0);
  const [previewTimeMs, setPreviewTimeMs] = useState<PromotionPreviewTimeMs | null>(null);
  const selectedStage = characterStages[selectedStageIndex];
  const beforeStage = characterStages[Math.max(0, selectedStageIndex - 1)];
  const canReplayPromotion = selectedStageIndex > 0;

  return (
    <main className="character-preview">
      <header>
        <p>DEVELOPMENT PREVIEW</p>
        <h1>主人公の成長演出</h1>
        <label htmlFor="character-stage">確認する姿</label>
        <select id="character-stage" value={selectedStageIndex} onChange={(event) => setSelectedStageIndex(Number(event.target.value))}>
          {characterStages.map((stage, index) => (
            <option key={stage.id} value={index}>フェーズ{stage.minimumCompletedPhases}：{stage.name}</option>
          ))}
        </select>
        <button type="button" disabled={!canReplayPromotion} onClick={() => setReplayCount((count) => count + 1)}>昇格演出を再生</button>
        <label className="character-preview-time-control" htmlFor="character-preview-time">停止位置</label>
        <select
          id="character-preview-time"
          value={previewTimeMs ?? ''}
          onChange={(event) => {
            const selectedValue = event.target.value;
            if (selectedValue === '') {
              setPreviewTimeMs(null);
              return;
            }
            const selectedTime = previewTimeOptions.find((time) => time === Number(selectedValue));
            setPreviewTimeMs(selectedTime ?? null);
          }}
        >
          <option value="">通常再生</option>
          {previewTimeOptions.map((time) => <option key={time} value={time}>{time}ms</option>)}
        </select>
      </header>

      <section aria-label="主人公の姿">
        {canReplayPromotion ? (
          <CharacterPromotion key={`${selectedStage.id}-${replayCount}`} beforeStage={beforeStage} afterStage={selectedStage} previewTimeMs={previewTimeMs ?? undefined} />
        ) : (
          <AvatarArt className="avatar-art" stage={selectedStage} />
        )}
        <h2>{selectedStage.name}</h2>
        <p>{selectedStage.description}</p>
      </section>
    </main>
  );
}
