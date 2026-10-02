# 第2章・1枚目：作業着

- 日付: 2026-10-02
- 使用: 内蔵imagegenで元賢者と採用旅人を参照し新規生成。その後、髪とメガネのみ修正。
- 参照: `src/assets/characters/sage/human-sage-black-hair-glasses-v2.png`（本人・質感）、`src/assets/characters/traveler/human-rural-traveler.png`（成長の連続性）。
- 保存: `src/assets/characters/traveler/human-workshop-worker.png`
- 目視確認: 青灰色の作業シャツ、茶色い革エプロン、丈夫なズボンと短い革靴、腰の羅針盤。袖を整える姿。前髪は作業に支障がない長さへ整った。メガネは修正後もやや横長に見え、完全な丸形ではない。
- 状態: 2026-10-02に前髪を下ろした保存済み版をユーザー正式採用。アプリ未組込、未コミット。背景に光彩が残り、完全透過は未達。build/lint未実施（画像のみ）。

## 新規生成プロンプト

```text
Use case: stylized-concept.
Create a FRESH full-body character illustration, chapter 2 first stage: the same protagonist now working as a skilled young craftsman in a western town workshop beginning to industrialize.
Reference 1 original finished sage is the authoritative facial identity, adult age, proportions, warm clean dry matte skin, finely resolved rendering and deep restrained colors. Do not copy sage costume, glasses shape, magic or pose.
Reference 2 accepted rural traveler is continuity for the same man and humble demeanor, round glasses, black hair and antique brass compass.
A clearly distinct WORK OUTFIT: plain muted blue-gray durable cotton work shirt with small collar, sleeves rolled evenly to forearms. A well-made dark warm brown leather bib work apron with simple shoulder straps, natural supple creases, usable stitched pockets, hem ending around knees. Plain charcoal-brown robust straight work trousers, short dark brown leather work shoes, no long boots. Clothes used but clean, no greasy stains. Remove rural outer jacket, waistcoat and large traveling satchel for working. Retain one small brass compass on a short belt attachment at side, visibly outside apron side edge, secure and unobtrusive, not duplicated.
Grooming improves in a modest transitional way: same black hair now lightly tidied into coherent natural forward/side locks, shorter less messy fringe keeping eyes clear for work. Not fully formal slicked-back hair yet. Same thin ROUND glasses now properly seated on bridge of nose, aligned with eyes. Keep same facial bone structure and clean warm complexion, focused approachable expression and relaxed brows.
Pose new, believable ready-to-work stance: feet shoulder-width, torso gently three-quarter, shoulders upright with humble ease. One hand casually adjusts the opposite rolled sleeve at forearm, hands visible and anatomically clear, no crossed arms or hands folded across chest. Looking ahead with mild concentration. No hands in pockets, arrogance, weapon or elaborate props.
Materials and palette: deep muted blue-gray, dark leather brown, charcoal brown. Match original fine sharp rendering with consistent fabric grain, leather stitching and coherent hair strands; natural dry skin, no oily highlights, plastic gloss, artificial stains, blur, washed out colors or brightness drift.
One complete full-length character with shoes and margins. GENUINE TRANSPARENT ALPHA BACKGROUND: character cutout only, no colored haze, backdrop, vignette, halo, floor, landscape, text or watermark.
```

## 最終修正プロンプト

```text
Use case: precise-object-edit. Edit ONLY head grooming in this workwear illustration. Replace rectangular spectacles with clearly circular ROUND thin metal spectacles, correctly seated at eye level. Change lifted slicked back black forelock to lightly tidied natural forward falling black fringe, uneven short locks over forehead ending ABOVE eyes so they stay clear for workshop work. A transitional tidy version of messy youth hair, NOT swept-back or a raised quiff. Preserve facial identity, expression, skin texture, deep colors, crisp detail, exact pose, sleeve adjusting hands, all work clothing, apron, compass and shoes unchanged. Genuine transparent alpha background without haze or vignette. No new objects.
```
