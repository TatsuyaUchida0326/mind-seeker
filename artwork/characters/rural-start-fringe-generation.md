# 田舎の青年：前下ろしの髪型

- 日付: 2026-10-02
- 使用: 内蔵imagegenによる髪型のみの編集。
- 編集対象: `src/assets/characters/traveler/human-rural-start.png`
- 保存: `src/assets/characters/traveler/human-rural-start-v2.png`（旧版保持）
- 目視確認: 前髪を不揃いに下ろし、眉から目元へ少しかかる黒髪。丸メガネ、衣装、姿勢、深い色合いを概ね維持。
- 状態: 2026-10-02にユーザーがスタートの1枚目として正式採用。アプリ未組込。背景には光彩が見えるため、完全透過の完成素材としては未確定。画像のみのためbuild/lint未実施。

## 最終プロンプト

```text
Use case: precise-object-edit.
Input image: the rural youth illustration is the edit target.
Change ONLY the hair: replace the swept-up, brushed-back forelock with genuinely DOWNWARD, messy black bangs. Hair grows forward from the crown and falls irregularly over the forehead, covering most of the forehead. Uneven soft separated locks reach just below eyebrow level and overlap the upper edges of the eyes slightly. Both eyes remain partly visible through gaps. Uncombed bedhead with natural asymmetry, not a tidy bowl cut. NO lifted front quiff, no slicked back hair, no exposed high forehead, no center-part curtains swept away from the face.
Preserve the same recognizable face, expression, warm dry matte skin, low round glasses, head angle, body, pose, hands, linen shirt, brown trousers, shoes, satchel, framing and deep restrained colors. Preserve the crisp fine rendering and original contrast; no lightening, no oily highlights or blurry fibers. One complete full-body character, no new equipment or text. Transparent alpha background; no vignette or backdrop.
```
