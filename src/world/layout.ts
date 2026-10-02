// wide: PC・スマホ横 ／ tall: スマホ縦
// TODO: スマホ縦専用の地図は未作成。今は tall も横長の地図を左右へたどる（同じ大きさ）
export type MapLayout = 'wide' | 'tall';

// world.css の縦向きスマホ用 @media と同じ条件にする
export const tallLayoutQuery = '(max-width: 600px) and (orientation: portrait)';

export const mapSizes: Record<MapLayout, { width: number; height: number }> = {
  wide: { width: 4520, height: 1924 },
  tall: { width: 4520, height: 1924 },
};
