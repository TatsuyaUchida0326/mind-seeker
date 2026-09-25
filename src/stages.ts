export interface Stage {
  id: string;
  name: string;
  x: number;
  y: number;
}

// 変換基準：1920x1080の画像に基づくSVG座標
export const stages: Stage[] = [
  { id: 'stage-01', name: 'カルミナ', x: 1580, y: 131 },
  { id: 'stage-02', name: 'ノルネ', x: 1540, y: 220},
  { id: 'stage-03', name: 'ネイア', x: 1265, y: 150 },
  { id: 'stage-04', name: 'ノクス', x: 1650, y: 288 },
  { id: 'stage-05', name: 'ヴァリア城', x: 1550, y: 319 },
  { id: 'stage-06', name: 'セグリア', x: 1600, y: 380 },
  { id: 'stage-07', name: 'ミレア', x: 1443, y: 510 },
  { id: 'stage-08', name: 'フェルモーラの里', x: 1455, y: 580 },
  { id: 'stage-09', name: 'ノヴァの隠れ里', x: 1410, y: 716 },
  { id: 'stage-10', name: 'リヴィアの里', x: 1286.4, y: 820 },
  { id: 'stage-11', name: 'ヨハの隠れ家', x: 1220, y: 880 },
  { id: 'stage-12', name: 'アルミナ', x: 1196, y: 700 },
  { id: 'stage-13', name: 'ルナリオ岬', x: 1110, y: 677 },
  { id: 'stage-14', name: 'グランベルト城', x: 1598, y: 765 },
  { id: 'stage-15', name: 'ケリス岬', x: 1636, y: 604 },
  { id: 'stage-16', name: 'カイロス', x: 1630, y: 505 },
  { id: 'stage-17', name: 'オルミス城', x: 1267.2, y: 468 },
  { id: 'stage-18', name: 'オルミス旧市街', x: 1090, y: 355 },
  { id: 'stage-19', name: 'カリスの里', x: 965, y: 626.4 },
  { id: 'stage-20', name: 'グランディール城', x: 800, y: 530 },
  { id: 'stage-21', name: 'アークス塔', x: 665, y: 830 },
  { id: 'stage-22', name: 'オルセア', x: 828, y: 780 },
  { id: 'stage-23', name: 'セレスタ', x: 533, y: 710 },
  { id: 'stage-24', name: 'ザハラ塔', x: 368, y: 833 },
  { id: 'stage-25', name: 'サリファ', x: 330, y: 646 },
  { id: 'stage-26', name: 'エルミナス城', x: 450, y: 360 },
  { id: 'stage-27', name: 'ベルネール', x: 380, y: 325 },
  { id: 'stage-28', name: 'エルド城', x: 525, y: 246 },
  { id: 'stage-29', name: 'グランティア城', x: 395, y: 147 },
  { id: 'stage-30', name: 'ミルティア城', x: 545, y: 103 },
  { id: 'stage-31', name: 'エルシードの双子塔', x: 793, y: 189 },
  { id: 'stage-32', name: 'シャルティア塔', x: 960, y: 290 },
  { id: 'stage-33', name: 'バルガの洞窟', x: 1277, y: 273 },
  { id: 'stage-34', name: 'ヴァルマリス海底神殿', x: 955, y: 490 },
  { id: 'stage-35', name: '黒の塔', x: 1494, y: 808 },
  { id: 'stage-36', name: '賢者の城', x: 330, y: 440 },
];
