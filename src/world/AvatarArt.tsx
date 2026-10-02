import travelerPortrait from '../assets/characters/traveler/traveler-shirt-and-bag.png';

export interface AvatarArtProps {
  wornCount: number;
  equipmentCount: number;
  className?: string;
}

// TODO: 装備ごとの姿の画像が揃ったら、wornCount に応じて切り替える（docs/story-structure.md「アイテムと主人公の姿」）。
// それまでは初期の旅人を表示する
export function AvatarArt({ wornCount, equipmentCount, className }: AvatarArtProps) {
  return <svg className={className} viewBox="0 0 260 390" role="img" aria-label={`旅人の姿（身につけた装備 ${wornCount} / ${equipmentCount}）`}>
    <image href={travelerPortrait} x="0" y="0" width="260" height="390" />
  </svg>;
}
