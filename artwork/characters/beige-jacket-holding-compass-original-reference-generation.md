# 羅針盤を持つ採用衣装・元画像参照での再生成

- 日付: 2026-10-02
- 方法: 内蔵 imagegen
- 主リファレンス: `src/assets/characters/sage/human-sage-black-hair-glasses-v2.png`（人物・色の深さ・質感）
- 補助リファレンス: `src/assets/characters/sage/human-beige-jacket-holding-compass.png`（採用した衣装・持ち方）
- 保存先: `src/assets/characters/sage/human-beige-jacket-holding-compass-v2.png`
- 確認: 生成結果の顔・手・羅針盤・衣装を目視確認。前案は保持。透明背景を指定したが背景透過の完全性は未検証。
- 状態: ユーザーは前案の衣装・構図を採用。新版の承認、アプリ組込、段階番号の決定は未実施。

## 最終プロンプト

```text
Use case: stylized-concept.
Primary request: Generate a fresh finished full-body character illustration from the ORIGINAL reference, with the approved beige suit costume and handheld compass. Reconstruct cleanly, with careful anatomy and crisp materials.
Input images: Image 1 is the PRIMARY original sage reference: authoritative character identity, facial anatomy, hair, glasses, warm matte skin, rich deep navy colors, restrained lighting and detailed painting quality. Image 2 is ONLY the approved costume and pose guide: beige jacket, white shirt, navy necktie and trousers, compass in left hand. Do not inherit the second image's accumulated distortions, bright highlights, or simplified textures.
Subject: Exactly the same adult human hero as Image 1, same black swept-back hairstyle, natural symmetrical eyes behind fine dark glasses, same facial proportions and quiet intelligent approachable expression. Clean matte warm skin, subtle natural shadows, no oily face.
Clothing: Modern tailored beige hip-length jacket with subtle refined woven texture, naturally layered over a clean white collared shirt and a deep navy neatly tied necktie. Deep ink-navy fitted full-length trousers with coherent seams, brown belt and gold buckle, polished black low leather shoes. No long coat, vest or book. Beige should be a rich restrained warm beige, not pale luminous cream.
Pose and compass: Natural modest standing stance, both feet grounded. Right arm rests naturally at side, relaxed anatomically correct hand. Left elbow bends gently; left hand holds the original palm-sized gold compass at upper abdomen, its cream dial and red-gold compass rose clearly facing viewer. Fingers support its rim and back, five coherent fingers with correct joints and fingernails; palm, wrist and sleeve fit naturally. Single gold chain drapes from compass with coherent links. No compass on belt, no duplicate objects.
Rendering: Match Image 1's sophisticated detailed illustration finish and deep tonal range. Maintain dark navy fabric depth, clean edges, fine controlled hair strands, natural cloth folds, precise tailoring, restrained highlights on metal and leather. Avoid overexposure, bloom, exaggerated rim light, plastic skin, tangled hair, fused fingers, warped compass dial, melted seams and random wrinkle noise.
Composition: A single full-body figure with shoes fully visible and comfortable margin, same vertical framing and character proportions as original. Genuine transparent alpha background, no vignette, scene, floor, text or watermark.
```

