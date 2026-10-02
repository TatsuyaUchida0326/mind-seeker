# 完成形賢者・元画像参照による再生成

- 日付: 2026-10-02
- 使用: 内蔵 imagegen
- 主参照: `src/assets/characters/sage/human-sage-black-hair-glasses-v2.png`（完成形の人物・衣装・構図・配色）
- 質感参照: `src/assets/characters/sage/human-beige-jacket-holding-compass-v2.png`（ユーザー採用済み。均一な仕上げのみ参照）
- 保存: `src/assets/characters/sage/human-sage-black-hair-glasses-v3.png`
- 目視確認: グレーのコート・紺衣装・茶色革の本・青い光・腰の羅針盤・黒髪メガネを維持。顔・手・服の描画を確認。
- 状態: 元画像保持。新版の採用はユーザー確認待ち。アプリ未組込。透過は指定のみで完全性未検証。

## 最終プロンプト

```text
Use case: stylized-concept.
Primary request: Regenerate the ORIGINAL completed sage as a fresh polished full-body illustration with evenly resolved materials, rich deep colors and precise natural anatomy.
Input images: Image 1 is the authoritative ORIGINAL completed sage reference for identity, entire costume, pose, accessories, palette and composition. Image 2 is the user-approved finish reference ONLY: emulate its clean uniform surface rendering, coherent fabric textures and sharp controlled detailing. Keep the completed sage design of Image 1.
Subject and identity: Same adult human male hero, same face, swept-back black hair, fine dark eyeglasses, warm natural matte skin, clean dry complexion and calm intelligent expression. Closely preserve facial proportions, hairstyle, body proportions and pose of Image 1.
Completed sage costume: Gray patterned full-length tailored overcoat with refined light gold edging, entirely deep navy inner lining apart from narrow gray hem facings. Coat drapes naturally from shoulders over shirt and vest, separates visibly from trousers and belt at waist. Deep navy collared shirt and detailed navy waistcoat with gold buttons and piping. Brown patterned necktie with gold clasp. Deep ink-navy full-length trousers, brown leather belt with gold buckle, short polished black leather shoes. Preserve the original design and restrained rich palette precisely.
Book and compass: Open brown leather wisdom book supported naturally in his left hand; right hand delicately poised above pages as in Image 1. Brown leather covers, fine gold corners and edging, ivory pages and coherent binding, a very soft pale blue glow rising only from the pages. One original palm-sized gold compass with cream dial and red-gold compass rose hangs from belt on viewer right, correct coherent chain. No staff or handheld compass.
Finish: Unify the quality across face, hair, hands, coat, shirt, trousers, shoes, book and compass. Even cloth base colors with consistent fine woven pattern, coherent shadows following folds, no random blotches, patchy brightness, smudges or grainy color noise. Rich deep navy and charcoal midtones, restrained warm skin, preserve darkness and saturation, delicate controlled highlights. Anatomically correct separate fingers, wrists and eyes; orderly fine hair strands; intact coat seams and book geometry. Polished detailed fantasy character illustration in the same style as references, not a different art style.
Framing: Single full-length figure, original three-quarter stance and lightly flowing long coat, both shoes fully visible with margin. Transparent alpha background, no painted backdrop, vignette, ground or text.
Avoid: pale or washed-out colors, excessive bloom, oily glossy skin, exaggerated outline lighting, plastic surfaces, wardrobe redesign, beige jacket, white shirt, altered face, extra accessories, duplicate compass, malformed fingers or fused sleeves.
```

