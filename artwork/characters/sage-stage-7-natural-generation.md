# 第7段階・元画像から自然な立ち姿を生成

2026-10-02、内蔵imagegenで編集。途中の生成画像を参照せず、完成形を直接参照した。

入力: `src/assets/characters/sage/human-sage-black-hair-glasses-v2.png`

保存先: `src/assets/characters/sage/human-sage-stage-7-without-book-v3.png`

目視確認: 本と光を外し、両腕を下ろして指を自然に緩めた立ち姿。手の組み合わせやポケット姿勢を解消。元画像と同じ深い紺・グレーと布の模様を参照。生成編集のため画素単位の同一性は保証しない。アプリへの組込は未実施。

## 使用プロンプト

Use case: precise-object-edit. Edit target and ONLY visual reference: the provided ORIGINAL finished sage image, not any previous intermediate variant. Create the stage immediately before acquiring the book. Localized changes: remove the entire open book and its blue magical glow; reposition both arms to hang naturally at his sides, elbows softly bent, fingers loose, palms facing inward. Hands visibly outside pockets, separated, not clasped, not folded, not crossed. Calm approachable intellectual, relaxed shoulders, subtle natural weight on one leg with feet comfortably placed rather than stiff ceremonial posture. Preserve the original head and face, black swept-back hairstyle, eyeglasses, warm matte clean skin, expression, gray patterned coat with fine piping and continuous navy lining, navy shirt and vest, brown tie and gold clasp, brown belt with gold buckle, gold compass and chain, navy trousers and short black leather shoes. Reconstruct only the areas formerly obscured by book and the sleeve/hand regions needed for the pose. Match the original reference's EXACT rich subdued deep gray and navy colors, shadow density, dark midtones, local contrast and crisp intricate fabric/hair detailing. No exposure increase, no brighter blue, no milky haze, no smoothing or oily skin, no simplification of textures, no redesign. Maintain full-body portrait composition and original illustration finish. Transparent alpha background, no background halo or vignette painted into the asset. No text, no new accessories.
