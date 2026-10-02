// 物語資料「研修各ストーリー素案（更新用）」に合わせた章・目的地・フェーズ・アイテム。
// 構成の正本は docs/story-structure.md。第1章の本文は docs/story-chapter1-map-adaptation.md の修正版。
// 表現ルール（武器の表現を使わない等）は docs/story-wording.md。

export type EquipmentSlot = 'waist' | 'shoulder' | 'foot' | 'body' | 'coat' | 'neck' | 'belt' | 'hand';

export interface Item {
  id: string;
  name: string;
  effect: string;
  // 元資料の「キーワード」列。アイテムに添えるひとこと
  keyword: string;
  // 身につける装備だけが持つ。獲得すると主人公の姿が変わる。
  // TODO: slot は装備ごとの姿の画像を重ねる段階で使う（docs/story-structure.md「アイテムと主人公の姿」）
  equipment?: { slot: EquipmentSlot; appearance: string };
}

export interface StoryBlock {
  heading?: string;
  text: string;
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  trainingTheme: string;
  // TODO: 第2章・第3章の物語は、地図を作るときに舞台とあわせて見直して入れる（docs/story-structure.md）
  story: StoryBlock[] | null;
  questions: string[];
  item: Item;
}

export type PlaceKind = 'town' | 'finale';

export interface Place {
  id: string;
  number: number;
  chapterNumber: number;
  kind: PlaceKind;
  name: string;
  phases: Phase[];
  // 地図の絵がある目的地だけが持つ（第1章の地図の SVG 座標）
  position: { x: number; y: number } | null;
}

export interface StoryChapter {
  number: number;
  title: string;
  subtitle: string;
  places: Place[];
}

function serialId(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(2, '0')}`;
}

// フェーズ1から順に並べる。n 番目のアイテムはフェーズ n で手に入る
const itemRows: Array<Omit<Item, 'id'>> = [
  { name: '感情のコンパス', effect: '自分の感情を正確に読み解く力を高める', keyword: 'このコンパスは、あなたの心を静かに広げていく、、、', equipment: { slot: 'waist', appearance: '感情のコンパスを携える' } },
  { name: '人格の書', effect: '表面的な個性と内面の人格の違いを見抜く', keyword: 'この本は静かに、しかし確実にあなたに力を与えていく、、、' },
  { name: 'パラダイムの舵', effect: '状況を柔軟に捉え直し、新しい見方を持てる', keyword: 'それは、周囲との絆を深めるキッカケを与えてくれる、、、' },
  { name: '視点のマント', effect: '他者の視点を理解し共感する能力を強化', keyword: 'このマントはあなたに大きな希望の光をもたらす、、、', equipment: { slot: 'shoulder', appearance: '相手の視点を思い出すマントを羽織る' } },
  { name: '内なる羅針盤', effect: '外的要因ではなく内的動機で行動を選べる', keyword: 'あなたの行動に確かな意味を与えるはず、、、' },
  { name: '習慣の水晶', effect: '小さな行動を積み重ねて習慣化する力を高める', keyword: '毎日の一歩があなたの輝かしい未来を作っていく、、、' },
  { name: '共鳴の種', effect: '相互依存の関係を築く力が高まる', keyword: 'あなたに誰かと本当の繋がりの芽を与えてくれる。' },
  { name: '自己決定の旅靴', effect: '環境や過去に左右されず選択する力を得る', keyword: 'その靴はあなたの意志を明確にしてくれる、、、', equipment: { slot: 'foot', appearance: '自分で選んだ道を進む旅靴を履く' } },
  { name: '選択の方位磁針', effect: '正しい方向へと導く判断力が上がる', keyword: 'その方向が成長へ導き、やがて大きな飛躍へと繋がる。' },
  { name: '言葉の灯篭', effect: '純粋な言葉で自己と他者を照らす力が強化される', keyword: 'あなたの内なる旅は、ここからさらに加速していく。' },
  { name: '関心の雫', effect: '集中力が高まり、優先順位の判断力が増す', keyword: '本当に大事なことに気づくことができる。' },
  { name: '挑戦者のランタン', effect: '失敗の中に希望の道筋を照らす', keyword: 'その挑戦の先に、新たな希望が隠れている。' },
  { name: '主体性の鍵', effect: '自分の意思で未来を描く力を得る', keyword: '未来は誰かではなく、あなた自身で切り開けるようになる。' },
  { name: '導きのトーチ', effect: '人を照らす“姿勢”でリーダーシップを発揮できる', keyword: 'その灯りが仲間の道を照らしている。' },
  { name: '時空の砂時計', effect: '時間の流れを可視化でき、重要タスクに集中できる', keyword: '今その時間が、これからのあなたを創っていく。' },
  { name: '任命のリング', effect: '仲間に力を託し、信頼を強化する', keyword: 'そのリングは仲間の能力を最大限に発揮させる。' },
  { name: '信頼のクリスタル', effect: '信頼の蓄積により人間関係が安定する', keyword: '繰り返し磨く事で本物の信頼が手に入る。' },
  { name: '共栄の上衣', effect: 'Win-Winの精神を具現化し、協働を促進する', keyword: 'その上衣をまとい、共に進む未来を切り開く。', equipment: { slot: 'body', appearance: '協働のために旅装を整える' } },
  { name: '共鳴の石', effect: '相手の立場を深く理解する力を得る', keyword: 'その石に耳を当てると”心の声”が聞こえる。' },
  { name: '鍛錬のハンマー', effect: '自己成長の継続に必要なモチベーションを強化', keyword: 'あなたの中に眠る可能性が、今目覚める。', equipment: { slot: 'coat', appearance: '学びを支える旅装を磨く' } },
  { name: '判断の古文書', effect: 'リーダーとしての自己評価力を得る', keyword: 'あなたの未来の行動を導いてくれる。' },
  { name: '人格の原石', effect: 'リーダーの人格（誠実・謙虚・責任）を深める', keyword: 'この原石を宝石に変えれるかどうかはあなた次第。', equipment: { slot: 'neck', appearance: '誠実さを表す装いを整える' } },
  { name: '沈黙の笛', effect: '言葉よりも心で聴く力を引き出す', keyword: 'この笛は相手の本心を聞けること。最後まで相手の話を聞くことができたなら、、、' },
  { name: '奉仕の苗', effect: '仲間への支援や信頼形成を促進する', keyword: '奉仕し支えることで、本当の仲間が手に入る。' },
  { name: '欲求の天秤', effect: '自分の成長段階を客観的に認識できる', keyword: 'その一つ一つの成長が、あなたを大きく飛躍させる。' },
  { name: '育成のペンダント', effect: '他者の才能を引き出す共鳴力を高める', keyword: 'あなたと相手の未来に新しい人生の色を与える。' },
  { name: '規律のオーブ', effect: '行動の一貫性・問題解決・創造性を強化', keyword: 'あなたと仲間の可能性を引き出してくれるはず。', equipment: { slot: 'belt', appearance: '日々の規律を旅装に刻む' } },
  { name: '対話の翼', effect: 'コミュニケーション力を飛躍的に向上させる', keyword: 'その言葉は、仲間の未来に大きなエネルギーを与えてくれる。' },
  { name: '未来の地図', effect: '価値観とビジョンを融合した人生設計ができる', keyword: 'その地図が、みんなの未来をより一層加速させる。' },
  { name: '真実の秘宝', effect: 'すべての学びと成長の結晶であり、人格形成の結晶', keyword: '“本当の宝”は、あなた自身の内なる人格という原石に宿っている。', equipment: { slot: 'hand', appearance: '悟りの書を手に、賢者の姿になる' } },
];

const items: Item[] = itemRows.map((item, index) => ({ id: serialId('item', index + 1), ...item }));

export const equipmentCount = items.filter((item) => item.equipment).length;
export const keepsakeCount = items.length - equipmentCount;

const firstChapterStories: Partial<Record<number, Pick<Phase, 'story' | 'questions'>>> = {
  1: {
    story: [
      { text: 'はるか昔、かつて古代の探検家が「伝説の秘宝」を見つけるための地図を作成したという言い伝えがありました。この地図は探検家の人生を通じて彼が経験した出来事の全てを記録しており、強みや成長の秘訣が隠されていると言われています。ある日、この地図が失われ、今に至るまでその行方はわからなくなっていました。皆さんはこの「失われた地図」を探す冒険に出ることになります。' },
      { text: 'この地図を通じて、自身の強みや成長を探り「伝説の秘宝」という宝を見つけ出すための手がかりを探すのが最初のミッションとなります、、、' },
    ],
    questions: [],
  },
  2: {
    story: [
      { text: '遥か昔、二つの古代王国が隣接して存在していました。一つは「魔性の王国」、もう一つは「賢者の王国」。魔性の王国は、鮮やかな色彩と斬新な建築で知られ、その住民たちは自己表現を重んじ、常に新しい技術やアイデアで自分自身の成功を追求していました。しかし、その関係は表面的で、しばしば目先の利益に溺れ、深い信頼関係を築くことができず争いごとが絶えませんでした。一方、賢者の王国は強固な石で造られた高い塔が特徴で、住民は誠実さ、謙虚さ、忍耐といった人格の美徳を大切にし信頼関係を築いていました。彼らは真の成功を追求し、その基盤となる原則（あり方）を日々磨き生活を送っていました。' },
      { text: 'ある日突然、両国の境にある始まりの町のはずれに突如不気味なダンジョンが出現しました。伝説では「このダンジョンを攻略した者は、大きな力を得ることができるだろう」という言い伝えがあった、、、' },
    ],
    questions: [
      'あなたはどちらの王国で仲間を集め、ダンジョン攻略の準備を整えたいと思いますか？',
    ],
  },
  3: {
    story: [
      { text: '「魔性の王国」と「賢者の王国」の間に現れた不気味なダンジョンを探索する冒険から数日後、両国の代表者たちはダンジョンの深部で古代の船を発見します。この船は「真実につながる舟」と呼ばれ、伝説によれば乗船する者に新たな視点で世界を見れる力を与えると言われています。しかし、この船を動かすには、両国の住民が協力しあわないと動かすことができない仕組みになっていることがわかった、、、' },
    ],
    questions: [
      'あなたはこの船に乗りたいと思いますか？乗りたい理由は何で、この船に乗るためには何が必要なのでしょうか？',
    ],
  },
  4: {
    story: [
      { text: '「真実につながる舟」での舟旅を終えた後、魔性の王国と賢者の王国の代表者たちはさらなる理解と協力を深めるため、新たな冒険に出ます。彼らは次に「見方の村」と呼ばれる神秘的な場所を訪れることに決めます。この村は、見る角度によって全く異なる景色が現れることで知られています。' },
      { text: '代表者たちは村に到着し、村の中心に立つ風車の「視点の扉」と呼ばれる古い扉を探し当てます。この扉をくぐると、自分たちがこれまで見てきた世界とは全く異なる新しい現実を体験することができました。' },
      { text: 'この異なる現実では、彼らは普段とは逆の立場に置かれ、異なる視点から物事を見ることを強いられます。たとえば、魔性の王国の代表者は賢者の王国の視点を、賢者の王国の代表者は魔性の王国の視点を体験します。これにより、彼らは自身の信じてきたパラダイムがどのように自分の行動や判断に影響を与えていたかを深く理解することができたのです、、、' },
    ],
    questions: [
      '相手と入れ替わった時にどのような気持ちになったでしょうか？',
      'また、自分はこれからどのような考えを持つべきだと感じたでしょうか？',
    ],
  },
  5: {
    story: [
      { text: '「視点の扉」を通過し、異なる視点から物事を見る体験をしたあなたは、新たな冒険に進みます。次に風車の村の外に広がる「内なる羅針盤平原」と呼ばれる場所に到着します。この平原は、訪れる者に自分の心の内側を映し出す薬草を与えることで知られています。' },
      { text: 'その薬草を使うと自分の本当の内面を深く理解し、無意識のうちに繰り返してきた行動や言動がどのような結果をもたらしていたかを知ることができた、、、' },
    ],
    questions: [
      'あなたはこの薬草を使ってみたいと思いますか？',
      '使ってみたい理由はなんですか？',
    ],
  },
  6: {
    story: [
      { text: '次に進むのは習慣の森です。あなたはそこで三人の人物に出会います。これらの人物はそれぞれ「知識の守護者」、「スキルの使い手」、「やる気の管理者」と名乗り、彼らはあなたの潜在能力を開花するための三つの鍵を渡します。' },
      { text: '知識の守護者は「知識の水晶」を持ち、習慣がなぜ重要なのか、その習慣がもたらす具体的な利益を教えます。あなたは行動の背景にある理由を学び、その知識を活用して目的意識を持った行動を選択するようになります。' },
      { text: 'スキルの使い手は「スキルの杖」を使って、知識を行動に変える具体的な方法を理解することができます。さらにこの段階では、考えから実践へと移行し、実際に新しい習慣を身に付ける技術や方法を学ぶ事ができます。' },
      { text: 'やる気の管理者はやる気の内功を使って、行動を持続させるための内的な動機づけを強化する事ができます。あなたは自分の内面から湧き上がる情熱を感じ、行動を継続するために自己を鼓舞する技術を身につけます。' },
    ],
    questions: [
      'あなたはこの三つの鍵を手に入れる事ができましたか？',
      'また、その鍵の使い方は理解できましたか？',
    ],
  },
  7: {
    story: [
      { text: '「習慣の森」での学びを経て、「相互依存の川」へとたどり着く、、、' },
      { text: 'この川は、仲間同士が共に支え合い共に成長する事で渡ることができるという場所として知られています。' },
      { text: 'あなたは川を渡る前の岸辺で二つの部族、「足枷の部族」と「共鳴の部族」に出会います。これらの部族は共に協力生活しており、彼らの誰かが持っていると言われている「絆の秘訣」という特殊能力を探すこととなりました。' },
      { text: '足枷の部族は、誰かが狩りや木の実をとってきてくれと信じ、自分はあまり働かずただじっと与えてもらうのを待っている事に1日の時間の多くを費やしていました。' },
      { text: '共鳴の部族は、意欲的に狩りに出かけ、罠を仕掛けたりそれぞれの強みを活かした道具を持って仲間同士協力し合って常に周りのために行動をしていました。' },
    ],
    questions: [
      'あなたはどんなメンバーと一緒に冒険をしたと思いますか？',
    ],
  },
  8: {
    story: [
      { text: 'あなたは川辺にそびえる古い塔「意志の塔」に到着します。この場所は自己の心の奥底に眠っている三つの心の試練を映し出します。' },
      { text: '塔には三つの迷宮があり、それぞれが異なる試練を象徴しています。' },
      { heading: '血脈の迷宮（遺伝的決定論）', text: 'あなたは先祖から引き継がれた力を探求し、遺伝的な特性があなたの行動や性格を決めています、、、' },
      { heading: '記憶の迷宮（心理的決定論）', text: '「記憶の鏡」を用いて、自分の行動に潜む根底にある動機や恐れを感じ、それらの原因は全て自分を育てた両親や周りのせいだと思っている、、、' },
      { heading: '環境の迷宮（環境的決定論）', text: 'せっかく冒険に出かけたのにお金もないし助けてくれる人もいない。天気も悪く道も歩きづらくどこに向かって進めばいいのかわからない、、、' },
    ],
    questions: [
      'あなたは今どんな気持ちで旅をしていますか？',
      'うまくいっていない、その原因はなんですか？',
    ],
  },
  9: {
    story: [
      { text: '次にあなたは「自由の大河」へ漕ぎ出します。この大きな川は常に変わりゆく天候と急流、そして様々な風が吹き荒れる流域で、数多くの船着き場が点在しています。 それぞれの船着き場には異なる食料や道具などがあり、あなたは自分の意思に基づいて目的地を選択しなければなりません。' },
      { text: 'そう、船長の選択と判断がこれからの冒険の運命を握っているのです、、、' },
      { heading: '激しい急流の洗礼（刺激の嵐）', text: 'あなたは自分の船を操る船長として、外部の天気や環境に遭遇する、、、雨や嵐があなたの行く手を拒もうと襲ってきます。' },
      { heading: '感情の船長', text: '反応的な船長は周囲の環境によって方向を変え、最初に決めた目的地よりも楽な道を選択しどこへ向かっているかわからなくなってしまっています。' },
      { heading: '選択の航海士', text: '選択ができる船長は、どんな嵐や雨が降ろうが、目的地を目指すために仲間と協力し助け合い、何が必要でどう行動したらこの困難を乗り越えらるか考え選択し航海を続けていた。' },
    ],
    questions: [
      'あなたにはどんな選択ができますか？',
      'また、どのような結果を想像することができるでしょうか？',
    ],
  },
  10: {
    story: [
      { text: 'あなたは自由の大河を下り、「言葉の宿場」にたどり着きます。 この宿場はその住民たちが使う言葉によって環境が変化する神秘的な場所です。 宿場には「悲観の淵」と「楽観の灯り橋」という二つの有名な場所がありました。' },
      { heading: '悲観の淵', text: 'この地に行き着く人は、挑戦の時に落胆や無力感を表す言葉を使いがちです。 ここでは風景が常に曇りがちで、草木も生い茂らず、希望の花がほとんど咲いていません。' },
      { heading: '楽観の灯り橋', text: 'ここに行き着いた人は、どんな困難な状況になっても「必ず道は開ける心」を持った人だと言われています。 この言葉が橋の灯りから発せられる光のように周囲を照らし、宿場は色鮮やかな花々でいっぱいになり、暖かい風が吹き抜けています。' },
    ],
    questions: [
      'あなたはどんな言葉を選びますか？',
      'そしてどのような結果を望んでいますか？',
    ],
  },
};

const phaseRows: Array<Pick<Phase, 'title' | 'subtitle' | 'trainingTheme'>> = [
  { title: '分析開始！', subtitle: '自己認識の冒険、感情の地図を描く！', trainingTheme: '自己認識の冒険、感情の地図を描く' },
  { title: '自我の塔', subtitle: '個性主義と人格主義の迷宮', trainingTheme: '個性主義と人格主義の違い' },
  { title: '思考転換のクエスト', subtitle: 'パラダイムの航海', trainingTheme: 'パラダイムの転換' },
  { title: '視点の扉', subtitle: '転換の法則を知る', trainingTheme: '見方の違いで世界は大きく変わる' },
  { title: '内なる羅針盤', subtitle: 'インサイドアウトへの進化', trainingTheme: 'インサイドアウトの考え方' },
  { title: '習慣の森への挑戦', subtitle: '習慣の錬金術', trainingTheme: '習慣の三つの要素' },
  { title: '仲間との遭遇', subtitle: '絆の秘訣', trainingTheme: '相互依存への発展' },
  { title: '意志の塔', subtitle: '自己決定の試練', trainingTheme: '主体性を発揮する（自覚：3種類の決定論）' },
  { title: '自由の大河', subtitle: '選択肢の風向き', trainingTheme: '主体性を発揮する（選択の自由）' },
  { title: '言葉の魔法', subtitle: '自己達成の宝庫', trainingTheme: '言葉が「自己達成予言」になる' },
  { title: '道しるべの丘と洞察の湖', subtitle: '影響力の拡張', trainingTheme: '影響の輪と関心の輪' },
  { title: '失敗の洞窟から成功の山へ', subtitle: '困難の超越（克服）', trainingTheme: '成功は失敗の先にある、成功のはしご' },
  { title: '自立への道', subtitle: '主体性の鍵を探す', trainingTheme: '自己の主体性を確認する方法＋主体性を発揮する' },
  { title: '先導者の古代遺跡', subtitle: '人と物を動かす知恵', trainingTheme: 'リーダーシップとマネジメントの違い' },
  { title: '時間の砂時計（迷宮）', subtitle: '習慣の探索', trainingTheme: '時間管理のマトリクス' },
  { title: '任命の儀式', subtitle: 'デレゲーションの鎖', trainingTheme: 'デレゲーションの重要性' },
  { title: '信頼の戦略', subtitle: '信頼の財産', trainingTheme: '信頼残高という名の財産' },
  { title: '協力隊の結成', subtitle: 'Win-Winの視界', trainingTheme: 'Win-Winを考える' },
  { title: '理解の樹海', subtitle: '理解という力', trainingTheme: '理解してから理解される' },
  { title: '成長の鍛冶屋', subtitle: '研ぎ澄まされた刃', trainingTheme: '刃を研ぐ、成長の連続とプロセス' },
  { title: '現在地の確認', subtitle: '25の判断材料', trainingTheme: 'リーダーシップとは' },
  { title: '人格のオアシス', subtitle: 'リーダーシップの源泉', trainingTheme: 'リーダーシップとは人格である' },
  { title: '傾聴の寺院', subtitle: '深い理解への道', trainingTheme: 'リーダーシップとは傾聴である' },
  { title: '奉仕の薬草', subtitle: '奉仕（信頼）という名の薬', trainingTheme: 'リーダーシップとはサーバントである' },
  { title: '欲求という名の山脈', subtitle: '自分は何号目か？', trainingTheme: '人間の持つ基本的な欲求を知る' },
  { title: '人材育成の工房', subtitle: '才能の開花', trainingTheme: '人材育成の考え方と事業展開' },
  { title: '基地を築く', subtitle: '四つの規律', trainingTheme: '施設運営における四原則' },
  { title: '対話の空旅', subtitle: 'コミュニケーションの航路', trainingTheme: '効果的な対話ができるリーダーとは' },
  { title: '宝への道しるべ', subtitle: '伝説の地図作り', trainingTheme: 'リーダーのビジョン共有力' },
  { title: '本当の宝', subtitle: 'さぁ本当の冒険はここからだ！', trainingTheme: 'あなたの宝（未来）はどこにある？' },
];

export const phases: Phase[] = phaseRows.map((row, index) => {
  const number = index + 1;
  return {
    id: serialId('phase', number),
    number,
    ...row,
    ...(firstChapterStories[number] ?? { story: null, questions: [] }),
    item: items[index],
  };
});
interface PlaceRow {
  chapterNumber: number;
  kind: PlaceKind;
  name: string;
  firstPhase: number;
  lastPhase: number;
  position: Place['position'];
}

const placeRows: PlaceRow[] = [
  { chapterNumber: 1, kind: 'town', name: '始まりの町', firstPhase: 1, lastPhase: 3, position: { x: 485, y: 480 } },
  { chapterNumber: 1, kind: 'town', name: '風車の村', firstPhase: 4, lastPhase: 6, position: { x: 2320, y: 460 } },
  { chapterNumber: 1, kind: 'town', name: '川辺の里', firstPhase: 7, lastPhase: 9, position: { x: 4200, y: 705 } },
  { chapterNumber: 1, kind: 'finale', name: '言葉の宿場', firstPhase: 10, lastPhase: 10, position: { x: 4180, y: 1640 } },
  // TODO: 第2章・第3章の名前は仮。地図を作るときに物語とあわせて決め、座標を入れる
  { chapterNumber: 2, kind: 'town', name: '道しるべの丘', firstPhase: 11, lastPhase: 13, position: null },
  { chapterNumber: 2, kind: 'town', name: '先導者の森', firstPhase: 14, lastPhase: 16, position: null },
  { chapterNumber: 2, kind: 'town', name: '信頼の宝庫', firstPhase: 17, lastPhase: 19, position: null },
  { chapterNumber: 2, kind: 'finale', name: '成長の鍛冶屋', firstPhase: 20, lastPhase: 20, position: null },
  { chapterNumber: 3, kind: 'town', name: '天空の展望台', firstPhase: 21, lastPhase: 23, position: null },
  { chapterNumber: 3, kind: 'town', name: '癒しの野', firstPhase: 24, lastPhase: 26, position: null },
  { chapterNumber: 3, kind: 'town', name: '創造の基地', firstPhase: 27, lastPhase: 29, position: null },
  { chapterNumber: 3, kind: 'finale', name: '真実の宝庫', firstPhase: 30, lastPhase: 30, position: null },
];

export const places: Place[] = placeRows.map(({ firstPhase, lastPhase, ...row }, index) => ({
  id: serialId('place', index + 1),
  number: index + 1,
  ...row,
  phases: phases.slice(firstPhase - 1, lastPhase),
}));

export const storyChapters: StoryChapter[] = [
  { number: 1, title: 'さぁ、冒険の始まりだ！', subtitle: '心の扉を開こう' },
  { number: 2, title: '自己研磨の旅へ', subtitle: '必需品の探索' },
  { number: 3, title: '未来への光', subtitle: '本当の宝のありか' },
].map((chapter) => ({ ...chapter, places: places.filter((place) => place.chapterNumber === chapter.number) }));

// URL から受け取った文字列で引くため、Object.prototype のキー（constructor 等）に当たらない Map にする
const placesById = new Map(places.map((place) => [place.id, place]));

export function findPlace(placeId: string): Place | undefined {
  return placesById.get(placeId);
}

export function placeOfPhase(phase: Phase): Place {
  const place = places.find((candidate) => candidate.phases.includes(phase));
  if (!place) throw new Error(`フェーズ ${phase.id} の目的地がありません`);
  return place;
}

export function chapterOfPlace(place: Place): StoryChapter {
  const chapter = storyChapters.find((candidate) => candidate.number === place.chapterNumber);
  if (!chapter) throw new Error(`目的地 ${place.id} の章がありません`);
  return chapter;
}

export function placeKindLabel(place: Place): string {
  return `第${place.chapterNumber}章の${place.kind === 'finale' ? '終わりの地' : '町'}`;
}

export function phaseRangeLabel(place: Place): string {
  const first = place.phases[0].number;
  const last = place.phases[place.phases.length - 1].number;
  return first === last ? `フェーズ${first}` : `フェーズ${first}〜${last}`;
}
