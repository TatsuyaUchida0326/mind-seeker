export interface Stage {
  id: string;
  name: string;
  x: number;
  y: number;
}

// 地図 SVG（viewBox 1920x1080）上の座標。map.png（16:9）を全面に敷いた位置に合わせてある（2026-09-25 新地図で入れ直し）
export const stages = [
  { id: 'stage-01', name: 'カルミナ', x: 1698, y: 165 },
  { id: 'stage-02', name: 'ノルネ', x: 1645, y: 270 },
  { id: 'stage-03', name: 'ネイア', x: 1300, y: 190 },
  { id: 'stage-04', name: 'ノクス', x: 1780, y: 330 },
  { id: 'stage-05', name: 'ヴァリア城', x: 1650, y: 370 },
  { id: 'stage-06', name: 'セグリア', x: 1710, y: 450 },
  { id: 'stage-07', name: 'ミレア', x: 1620, y: 515 },
  { id: 'stage-08', name: 'フェルモーラの里', x: 1505, y: 595 },
  { id: 'stage-09', name: 'ノヴァの隠れ里', x: 1490, y: 815 },
  { id: 'stage-10', name: 'リヴィアの里', x: 1250, y: 795 },
  { id: 'stage-11', name: 'ヨハの隠れ家', x: 1210, y: 850 },
  { id: 'stage-12', name: 'アルミナ', x: 1145, y: 765 },
  { id: 'stage-13', name: 'ルナリオ岬', x: 1067, y: 660 },
  { id: 'stage-14', name: 'グランベルト城', x: 1770, y: 802 },
  { id: 'stage-15', name: 'ケリス岬', x: 1755, y: 575 },
  { id: 'stage-16', name: 'カイロス', x: 1790, y: 700 },
  { id: 'stage-17', name: 'オルミス城', x: 1400, y: 478 },
  { id: 'stage-18', name: 'オルミス旧市街', x: 1110, y: 420 },
  { id: 'stage-19', name: 'カリスの里', x: 1035, y: 690 },
  { id: 'stage-20', name: 'グランディール城', x: 780, y: 615 },
  { id: 'stage-21', name: 'アークス塔', x: 595, y: 770 },
  { id: 'stage-22', name: 'オルセア', x: 815, y: 860 },
  { id: 'stage-23', name: 'セレスタ', x: 500, y: 640 },
  { id: 'stage-24', name: 'ザハラ塔', x: 280, y: 920 },
  { id: 'stage-25', name: 'サリファ', x: 205, y: 725 },
  { id: 'stage-26', name: 'エルミナス城', x: 355, y: 420 },
  { id: 'stage-27', name: 'ベルネール', x: 270, y: 280 },
  { id: 'stage-28', name: 'エルド城', x: 440, y: 295 },
  { id: 'stage-29', name: 'グランティア城', x: 280, y: 185 },
  { id: 'stage-30', name: 'ミルティア城', x: 460, y: 140 },
  { id: 'stage-31', name: 'エルシードの双子塔', x: 755, y: 225 },
  { id: 'stage-32', name: 'シャルティア塔', x: 940, y: 340 },
  { id: 'stage-33', name: 'バルガの洞窟', x: 1335, y: 290 },
  { id: 'stage-34', name: 'ヴァルマリス海底神殿', x: 942, y: 560 },
  { id: 'stage-35', name: '黒の塔', x: 1615, y: 930 },
  { id: 'stage-36', name: '賢者の城', x: 185, y: 500 },
] as const satisfies readonly Stage[];

export type StageId = (typeof stages)[number]['id'];
