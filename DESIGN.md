# ImproveU — DESIGN BIBLE ("Showroom / Vault")

Build ONLY from this document + `css/styles.css` + `js/main.js`. Every page is a white automotive
**showroom** with a black **vault** under the floor. One physical prop — the black-and-chrome ImproveU
card — is the protagonist. Silver is never decoration: **chrome = earned/verified**, **black = the record**,
**white = clean paper after the cleanup**. State is signalled only by intensity (dim / bright / chrome / glow).
One light source (`--light`) moves across the whole page and every chrome surface answers it.

Non-negotiables: keep every filename, link, copy meaning, JSON-LD, meta; preserve integrations
(affiliate webform + `submitForm`, Scorexer links x3, Calendly embed, `form[data-form]` + `.form-success`,
qualifier `.q-step`, Google Maps placeholder comment). Phone everywhere = **(559) 900-9326 / `tel:5599009326`**
(nav CTA area, footer, contact, JSON-LD `telephone`). Do not touch `/creditjamess` or `/creditharley`.

---
## 1. Palette tokens (`:root`) — white / black / silver ONLY

```css
--white:#FFFFFF; --mist:#F4F5F7; --fog:#ECEDEF;              /* whites  */
--black:#0A0A0B; --graphite:#141416; --steel:#26272B;         /* blacks  */
--silver:#8E9199; --silver-2:#B9BCC3; --silver-3:#C9CCD2; --silver-4:#DDDFE3; /* silvers */
--chrome: linear-gradient(115deg,#8E9199 0%,#F4F5F7 18%,#C9CCD2 34%,#FFFFFF 50%,#ABAEB5 66%,#E8E9EC 82%,#8E9199 100%);
--chrome-dark: linear-gradient(115deg,#0A0A0B 0%,#26272B 30%,#8E9199 50%,#26272B 70%,#0A0A0B 100%); /* text on white */
--chrome-edge: linear-gradient(90deg,#8E9199,#FFFFFF 50%,#8E9199);   /* 1px hairlines, rims, seams */
--card-face: linear-gradient(135deg,#141416 0%,#0A0A0B 55%,#1A1B1E 100%);
--glow-white: 0 0 0 1px rgba(255,255,255,.06), 0 24px 80px rgba(255,255,255,.14);   /* on black only */
--shadow-1: 0 10px 30px rgba(10,10,11,.06); --shadow-2: 0 24px 60px rgba(10,10,11,.14);
--ease-out: cubic-bezier(.16,1,.3,1); --ease-spring: cubic-bezier(.34,1.56,.64,1); --ease-roll: cubic-bezier(.2,.9,.2,1);
--light: .5;  /* 0..1 ambient light phase, written by JS */  --mx:0; --my:0;  /* pointer -1..1 */
```
Text colors: on white → headings `#0A0A0B`, body `#26272B`, labels `#26272B` (never `#8E9199` below 24px on white — it is 3.5:1).
On black → headings `#FFFFFF`, body `#C9CCD2`, labels `#8E9199` (5.5:1 ok). Hairlines: `#DDDFE3` on white, `#26272B` on black.
FORBIDDEN (grep before ship): `#C9A24E #A6813A #5FB68E #C4523E #1C4130 gold green brick blue purple`.
Chrome text on white must use `--chrome-dark` and only at ≥1.5rem/700+ (large-text 3:1 rule).

---
## 2. Typography

Import (exactly, in every `<head>`):
`https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap`

| Role | Font / variation | Size / metrics |
|---|---|---|
| h1 `.h1` | Archivo `'wdth' 125,'wght' 900` | `clamp(3rem,8vw,7.5rem)` / lh .9 / ls -.03em; <640px use `'wdth' 112` |
| h2 | Archivo `'wdth' 118,'wght' 800` | `clamp(2.2rem,5vw,4.4rem)` / lh .95 / ls -.025em |
| h3 / h4 | Archivo `'wdth' 110,'wght' 700` | `clamp(1.35rem,2.2vw,1.9rem)` / 1.1rem, lh 1.15 |
| Accent `em.flourish` | Instrument Serif italic 400 | `1.08em` of parent, ls 0, **exactly one per headline** |
| Body | Archivo `'wdth' 100,'wght' 400` | 1.05rem / 1.65; `strong` = 600; `.lead` 1.25rem/1.5 |
| Label `.eyebrow`,`.mono-label` | JetBrains Mono 500 uppercase | .72rem, ls .24em |
| Data (prices, scores, stats, card number) | JetBrains Mono 700 (500 on card face) | `font-variant-numeric: tabular-nums` always |
| Button label | Archivo `'wdth' 110,'wght' 700` | .95rem, ls .01em |
| Footer wordmark `.wordmark` | Archivo `'wdth' 125,'wght' 900` | 18vw, color `#141416` on `#0A0A0B` (decorative only) |

Rules: sentence case headlines, never uppercase display. The accent word is black/white solid by default;
add `.chrome-dark` (white sections) or `.chrome` (vault) for shimmer — max 6 shimmer elements per page.
Set `font-variation-settings` per level; never animate it. Headlines: `text-wrap: balance`. Reading measure 68ch.

---
## 3. Layout system

Containers: `.container` max 1200px, `.container-wide` 1400px, `.container-narrow` 760px (legal/blog), gutters `clamp(20px,5vw,56px)`.
Section padding `.section` = `clamp(80px,10vw,144px) 0`; `.section-tight` = 56px 0. Grid: 12-col, gap 32px (24px <768).

Rhythm (strict, every page): **WHITE showroom → BLACK vault → MIST ledger → WHITE …**
- `.show` white `#FFFFFF`, black type. Hero, how-it-works, reviews, guarantee, forms live here.
- `.vault` black `#0A0A0B`, faint brushed texture (`repeating-linear-gradient(90deg,rgba(255,255,255,.02) 0 1px,transparent 1px 3px)`), graphite vignette edges, cursor spotlight, chrome word. Stats, "what we remove", pricing, team, CTA, footer.
- `.mist` `#F4F5F7` for ledgers, tables, FAQ, blog lists, legal paper.
- `.seam` — a 6px full-bleed chrome bar (`background: var(--chrome-edge)`) placed at EVERY white↔black boundary, like the bevel of a vault door. Its shine is `--light`-driven (§5). Never between white and mist.

Page skeleton: `nav` → `.hero` (white, or `.hero.vault` on portal/contact) → `.seam` → sections in rhythm → `.cta-banner.vault` → `footer.vault`.
Cards never sit "three in a row with icons" — cards are literal credit cards, ledgers, or physical tier cards.

---
## 4. Component catalog (class → canonical HTML → states)

### 4.1 Buttons `.btn`
Base: inline-flex, pill `border-radius:999px`, Archivo wdth110/700 .95rem, gap 10px, `min-width` locked on loading,
sizes `.btn-sm` 38px/16px pad, default 48px/24px, `.btn-lg` 58px/32px, `.btn-xl` 68px/40px. Legacy aliases: `.btn-dark`→`.btn-secondary`, `.btn-outline`→`.btn-ghost`.
```html
<a class="btn btn-primary btn-lg" href="get-started.html">Start My File <span class="btn-arrow" aria-hidden="true">→</span></a>
<a class="btn btn-secondary" href="pricing.html">See Pricing</a>
<a class="btn btn-ghost" href="results.html">See Results</a>
<button class="btn btn-primary is-loading" aria-busy="true" type="submit"><span class="btn-label">Send</span></button>
```
| Variant | White ground | Inside `.vault` (on-dark, automatic) |
|---|---|---|
| `.btn-primary` CHROME | bg `var(--chrome)` 200% width, text `#0A0A0B`, `box-shadow: inset 0 1px 0 rgba(255,255,255,.7), inset 0 0 0 1px #8E9199, 0 8px 24px rgba(10,10,11,.18)` | same + `var(--glow-white)` |
| `.btn-secondary` BLACK | bg `#0A0A0B`, text `#FFFFFF`, 1px `#26272B` inner ring | bg `#FFFFFF`, text `#0A0A0B` |
| `.btn-ghost` | transparent, 1.5px `#26272B` border, text `#0A0A0B` | 1.5px `#B9BCC3` border, text `#FFFFFF` |
States — hover: magnetic pull + shine sweep (§5), `.btn-arrow` translateX(4px), ghost fills (`::before` scaleX 0→1 mist / white 8% on dark),
secondary border → chrome (`::before` mask ring). Active: `scale(.97)`. Focus-visible: `outline:3px solid #FFFFFF; box-shadow:0 0 0 5px #0A0A0B`.
`.is-loading`: `.btn-label` opacity 0, `::after` 18px ring `border:2px solid #8E9199; border-top-color:#FFFFFF` rotating 800ms linear, `pointer-events:none`.
Disabled: opacity .45, no motion. Every page has exactly ONE `.btn-primary.is-hero` (gets the ambient `--light` sheen).

### 4.2 Nav `.nav` (existing markup kept) + `.mobile-menu`
Transparent at top; `.nav.scrolled`: `rgba(255,255,255,.82)` + `backdrop-filter: blur(14px)` (the ONLY backdrop-filter on the site), 1px `#DDDFE3` bottom hairline fading in. 76px tall, `position:sticky`.
Links Archivo 600 .9rem `#26272B`; `.nav-links > a::after` and `.nav-dropdown > a::after` = 1px chrome-edge underline `scaleX(0→1)` 220ms, stays 1 on `[aria-current="page"]`.
`.nav-dropdown-menu`: white panel, 12px radius, 1px `#DDDFE3`, opens `translateY(8px→0)`+opacity 200ms on hover/focus-within/`.open`.
`.btn-login` = `.btn.btn-ghost.btn-sm`; Get Started = `.btn.btn-primary.btn-sm` (not magnetic in nav).
`.nav-toggle` spans morph to X (transform only). `.mobile-menu.active`: full-screen `#0A0A0B` vault, `clip-path: circle(0 at calc(100% - 40px) 40px) → circle(150% at …)` 600ms `--ease-out`; links Archivo wdth115/800 2.2rem white, stagger 40ms translateY(24px→0). Body scroll locked (existing JS). Esc closes; focus trapped.

### 4.3 Page header `.page-head` (all non-index pages)
```html
<header class="page-head show"><div class="container">
  <p class="eyebrow rv">Credit Repair Services</p>
  <h1 class="h1 hl">Credit repair done <em class="flourish chrome-dark">the right way</em></h1>
  <p class="lead rv">…</p></div></header>
```
Padding `clamp(120px,16vw,200px) 0 clamp(56px,7vw,96px)`; a mist radial pool `radial-gradient(60% 50% at 70% 60%, #F4F5F7, transparent)` behind. Legal pages use `.page-head.doc` (§6).

### 4.4 Section head `.sec-head` + eyebrow
```html
<div class="sec-head rv">
  <p class="eyebrow"><span class="eyebrow-dash" aria-hidden="true"></span>The Process</p>
  <h2 class="hl">Five phases. <em class="flourish">One outcome.</em></h2>
  <p class="sec-sub">…</p></div>
```
`.eyebrow-dash`: 32px×1px `var(--chrome-edge)`, `scaleX(0→1)` on reveal. `.sec-head.centered` centers. `.section-label` is an alias of `.eyebrow`.
Color: `#26272B` on white, `#8E9199` on vault.

### 4.5 The ImproveU Card `.iu-card` (hero object, pure CSS)
```html
<div class="card-stage" data-tilt data-float>            <!-- perspective:1400px -->
  <div class="iu-card-shadow" aria-hidden="true"></div>   <!-- separate blurred plane -->
  <div class="iu-card" role="img" aria-label="ImproveU member card (illustration)">
    <span class="iu-rim" aria-hidden="true"></span>       <!-- chrome bezel via mask -->
    <span class="iu-brush" aria-hidden="true"></span>     <!-- brushed texture -->
    <span class="iu-chip" aria-hidden="true"></span><span class="iu-wave" aria-hidden="true"></span>
    <img class="iu-logo" src="images/logo.png" alt="">
    <div class="iu-number" aria-hidden="true"><span class="odo" data-odo="0781">0487</span> 0093 2600 8080</div>
    <div class="iu-name" aria-hidden="true">IMPROVEU MEMBER</div><div class="iu-meta" aria-hidden="true">FRESNO · EST. 2018</div>
    <span class="iu-holo" aria-hidden="true"></span><span class="iu-glare" aria-hidden="true"></span>
    <span class="iu-panel" aria-hidden="true"></span>     <!-- chrome foil strip along bottom -->
  </div></div>
```
Spec: aspect 1.586, width `clamp(300px,34vw,520px)`, radius 22px, `background: var(--card-face)`.
`.iu-rim`: `inset:-1.5px; border-radius:inherit; background:var(--chrome); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; padding:1.5px`.
`.iu-brush`: the brushed repeating gradient at 40% opacity, `mix-blend-mode: overlay`. `.iu-chip`: 46×36, radius 7, `background:var(--chrome)` at 160deg, contact lines via `repeating-linear-gradient(0deg,transparent 0 5px,#8E9199 5px 6px)` inside a 2px inset, `box-shadow: inset 0 1px 0 #FFFFFF, inset 0 -1px 0 #8E9199, 0 1px 2px rgba(0,0,0,.6)`. `.iu-wave`: 4 arcs via `border:1.5px solid #B9BCC3; border-color:#B9BCC3 transparent transparent transparent` stacked, opacity .6.
`.iu-number`: JetBrains Mono 500 1.35rem ls .16em `#DDDFE3`, emboss `text-shadow: 0 1px 0 rgba(255,255,255,.2), 0 -1px 0 rgba(0,0,0,.9)`. `.iu-name/.iu-meta`: Archivo 600 wdth110 .72rem ls .22em same emboss.
`.iu-holo`: `linear-gradient(115deg,transparent 30%,rgba(255,255,255,.10) 42%,rgba(255,255,255,.55) 50%,rgba(255,255,255,.10) 58%,transparent 70%)`, `background-size:250% 100%`, `mix-blend-mode:screen`, `background-position: calc(var(--light)*100% + var(--mx)*30%) 0`.
`.iu-glare`: `radial-gradient(circle at calc(50% + var(--mx)*40%) calc(50% + var(--my)*40%), rgba(255,255,255,.22), transparent 42%)` screen. `.iu-panel`: 26px strip, `var(--chrome)` 200% width, position follows `--light`.
`.iu-card-shadow`: `filter:blur(28px)`, `#0A0A0B` at 45%, `transform: translate(calc(var(--mx)*-24px), calc(var(--my)*-14px + 34px)) scale(.94)` — moves opposite to tilt.
Variants: `.iu-card.mini` (260px wide, `.iu-number` replaced by a label: CLIENT PORTAL / AFFILIATE / FRANCHISE OWNER / rep name; tilt ±8°, no glare);
`.iu-card.silver` (face `var(--chrome)`, text `#0A0A0B` embossed `0 1px 0 #FFFFFF`); `.iu-card.blueprint` (black face + `#26272B` 24px hairline grid). Back face `.iu-back`: magstripe 44px `#141416` band + `.iu-sign` mist panel — used only on franchise.html.
`will-change: transform` on `.card-stage` and `.iu-card-shadow` ONLY.

### 4.6 Score ring + odometer `.score`
```html
<div class="score" data-ring="781" data-min="300" data-max="850">
  <svg class="ring" viewBox="0 0 300 300" aria-hidden="true"><defs><linearGradient id="chromeStroke" x1="0" x2="1">
    <stop offset="0" stop-color="#8E9199"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCD2"/></linearGradient></defs>
    <circle class="ring-track" cx="150" cy="150" r="120"/><circle class="ring-fill" cx="150" cy="150" r="120"/><circle class="ring-trail" cx="150" cy="150" r="120"/></svg>
  <div class="score-center"><span class="mono-label">Credit score</span>
    <span class="odo score-num" data-odo="781">487</span><em class="flourish score-word" data-words="Poor,Fair,Good,Excellent">Poor</em></div>
  <div class="score-range mono-label"><span>300</span><span>850</span></div>
  <span class="pill pill-chrome score-delta">+294</span></div>
```
Ring 14px stroke, `stroke-linecap:round`, rotated 135°, 270° sweep; track `#ECEDEF` (white) / `#26272B` (vault); fill `url(#chromeStroke)`; trail = white 40% following 200ms later. Digits JetBrains Mono 700 `clamp(3rem,6vw,7rem)`. As score rises the ring goes opacity .35→1 and gains `filter: drop-shadow(0 0 18px rgba(255,255,255,.55))` on vault (single element). No good/bad colors ever.

### 4.7 Report ledger `.ledger` (strike & stamp)
```html
<div class="ledger" data-ledger><div class="ledger-head mono-label"><span>Item</span><span>Creditor</span><span>Amount</span><span>Status</span></div>
  <div class="ledger-row" style="--i:0"><span class="ledger-n">01</span><span>Collection</span><span>Midland</span><span class="mono">$1,240</span>
    <span class="ledger-status">Open</span><span class="stamp" aria-hidden="true">Deleted</span></div>
  <p class="ledger-total mono-label">Items removed <span class="odo" data-odo="12">0</span></p></div>
```
Sheet: white (on mist) or `#141416` (in vault) with 1px `#DDDFE3`/`#26272B` rules, JetBrains Mono for amounts/numbers, Archivo .95rem for text. `.ledger-row.is-struck`: text → `#B9BCC3`, `::after` 2px strike bar (`#0A0A0B` on white, `#FFFFFF` on dark) `scaleX(0→1)` from left 260ms; `.ledger-status` text swaps to "Deleted" for AT. `.stamp`: Archivo wdth125/900 .9rem uppercase, 2px outline (`#0A0A0B` on white / `#DDDFE3` on dark), `rotate(-8deg)`, lives in the row's last cell (not clipped). Variant `.ledger.rights` (croa): chrome check draws instead of strike.

### 4.8 Stat tiles `.stat-band > .stat-cell` (existing classes, vault only)
```html
<div class="stat-band"><div class="stat-cell rv" style="--i:0"><div class="num"><span class="odo" data-odo="8">0</span><span class="unit">+</span></div><div class="lbl">Years in Business</div></div></div>
```
Numbers Archivo wdth120/900 4rem `.chrome`, `.unit` Instrument Serif italic `#B9BCC3`, `.lbl` Archivo .85rem `#B9BCC3`; cells split by 1px `#26272B` with a 24px chrome tick at top.

### 4.9 Badges / pills `.pill`
`<span class="pill">8 Years Strong · Fresno Built</span>` — 32px, mono .7rem ls .18em uppercase, 1px border.
`.pill` white/`#DDDFE3`/text `#26272B`; `.pill-black` `#0A0A0B`/white; `.pill-chrome` `var(--chrome)`/`#0A0A0B`; `.pill-outline` (vault) `#B9BCC3` border/white; `.pill-live` prepends a 6px white dot that pulses (opacity) — used for "OPEN NOW". Replaces `.hero-pill`, `.badge`, `.pricing-badge` (Most Popular → `.pill-chrome`, Fastest Results → `.pill-black`).

### 4.10 Content card `.card` / step `.card-step`
White, 1px `#DDDFE3`, radius 18px, 1px chrome top edge (`::before` 1px `var(--chrome-edge)`), `--shadow-1`; in vault: `#141416` + chrome hairline rim. `.step-num` JetBrains Mono 4rem at 8% opacity, counter-shifts 6px on hover. Hover: `translateY(-6px) rotate(.6deg)`, rim brightens. Steps sit on a `.rail` (§5).

### 4.11 Pricing tier `.pricing-card` (physical cards)
```html
<article class="pricing-card tier-2 rv" data-tilt>
  <div class="iu-card mini tier-face"><!-- silver | (black) | blueprint face, tier name embossed --></div>
  <span class="pill pill-chrome">Most Popular</span><h3 class="tier-name">The Unlimited</h3>
  <div class="pricing-price"><span class="odo" data-odo="2497" data-prefix="$">$0</span></div><p class="pricing-note">…</p>
  <ul class="pricing-features"><li><svg class="check"…/>…</li></ul><a class="btn btn-primary" href="get-started.html">Choose plan</a></article>
```
Tier 1 The Reset = `.iu-card.silver` face; Tier 2 The Unlimited = black card, wrapper gets `var(--glow-white)` breathing 6s; Tier 3 The Blueprint = `.iu-card.blueprint`. Features on mist with chrome checks drawn via stroke-dashoffset (60ms stagger). Offer/notice box → `.notice`: `#0A0A0B` block, 4px chrome left rule, `NOTICE` mono label, white text (no red).

### 4.12 Team card `.team-card`
```html
<figure class="team-card rv"><div class="team-stage"><span class="team-spot" aria-hidden="true"></span><img src="images/joseph-web.png" alt="Joseph, credit specialist" data-parallax="-30"></div>
  <figcaption><h3>Joseph</h3><p class="mono-label">Credit Specialist</p></figcaption></figure>
```
Vault panel with a chrome floor line under the cutout and a white radial `.team-spot` behind the head that follows the pointer; ±5° tilt on hover. Use only images that exist: james-hero-web, james-tux-web, james-about-web, joseph-web, harley-web, instagram-profile-web.

### 4.13 Testimonial `.review-card` (existing structure)
White, 1px `#ECEDEF`, `.review-avatar` initial in a black circle (chrome text), `.review-stars` five chrome-filled ★ (`.chrome`, no yellow), `.google-icon` "G" outline in `#8E9199`. Each card carries `style="--tilt:-1.2deg"` (range ±1.6°) like stacked paper; hover straightens + lifts (§5).

### 4.14 Trust strip `.trust-strip` / `.trust-logos`
White band, 1px `#DDDFE3` rules, logos `filter:grayscale(1) contrast(1.1)` opacity .7 (static filter), `smartcredit-white.png` inside vault. Shared `.shine-band` sweeps the row (§5); hover → opacity 1, translateY(-2px).

### 4.15 Ticker `.ticker > .ticker-track` (existing content; JS duplicates the track)
Black band between two chrome hairlines; items: `<span><span class="mono chrome">+180 pts</span> approved for a $385K mortgage</span>`; `aria-hidden="true"` plus a visually-hidden `<ul class="sr-only">` copy. Edges fade via `mask-image`.

### 4.16 Forms `.field` (contact, get-started qualifier, affiliate wrapper-only)
```html
<div class="field"><label class="mono-label" for="email">Email</label><input id="email" type="email" required><span class="field-line" aria-hidden="true"></span></div>
```
48px, white, 1.5px `#C9CCD2`, radius 12px; vault: `#141416` + `#26272B`. Focus: border `#0A0A0B` (white on dark) + `box-shadow: 0 0 0 4px rgba(10,10,11,.08)` + `.field-line` chrome `scaleX(0→1)`. Error `.is-error`: 2px `#0A0A0B` border + shake (translateX ±4px ×3, 300ms) + mono message. Qualifier `.q-choice` = `.btn-ghost` pills, `.selected` fills black; `.q-progress` chrome rail. `.form-success`: scales .95→1, `.success-mark` check draws via stroke-dashoffset, "RECEIVED" `.stamp`.

### 4.17 FAQ accordion `.faq-item` (existing JS classes)
```html
<div class="faq-item"><button class="faq-question" aria-expanded="false" aria-controls="a1" id="q1"><span class="faq-n mono-label">01</span>Question? <span class="faq-plus" aria-hidden="true"></span></button>
  <div class="faq-answer" id="a1" role="region" aria-labelledby="q1"><div class="faq-inner"><p>…</p></div></div></div>
```
Mist rows, Archivo wdth110/700 question, `.faq-plus` chrome "+" in a black circle. `.active`: row turns `#0A0A0B` with white text (the vault opens), plus rotates 45°, left chrome bar `scaleY`, panel `grid-template-rows: 0fr→1fr` 400ms. First item open by default. Enter/Space toggle; arrow keys move between questions.

### 4.18 CTA banner `.cta-banner`
Vault section with cursor spotlight, chrome seam above, h2 with one `.chrome` accent word, `.btn-primary.is-hero` + `.btn-ghost`, phone as `<a class="mono chrome" href="tel:5599009326">(559) 900-9326</a>`.

### 4.19 Guarantee `.guarantee`
White certificate frame (double hairline: 1px `#0A0A0B` outside, 1px `#C9CCD2` inside, 8px apart), rotating `.seal` (SVG textPath "90-DAY GUARANTEE · IMPROVEU · FRESNO CA", stroke `url(#chromeStroke)`, still "IU" monogram in Instrument Serif), `.signature` "James" Instrument Serif italic 3rem.

### 4.20 Footer `footer.footer` (existing markup, restyled)
Vault + seam above; `.wordmark` "IMPROVEU" cropped at bottom; columns `h4` mono-label; links `#B9BCC3`→`#FFFFFF` with chrome underline; phone `(559) 900-9326` → `tel:5599009326` in JetBrains Mono; `.footer-croa` `#8E9199` .78rem (5.5:1). `.mobile-sticky-cta` keeps `.btn-primary`.

### 4.21 Utilities
`.chrome` (bright shimmer text, vault only), `.chrome-dark` (white grounds, display size only), `.mono`, `.mono-label`, `.eyebrow`, `.sr-only`, `.seam`, `.pill*`, `.stamp`, `.odo`, `.rv`, `.hl`, `.text-center`.

---
## 5. Motion catalog — four tiers, one clock, one rAF loop

**Engine (main.js):** ONE `requestAnimationFrame` loop is the only per-frame writer. It (a) advances `--light` on `<html>` (0→1 over 14s, eased sine, loops), (b) lerps pointer targets at 0.08 for every `[data-tilt]`, `[data-mag]`, spotlight and parallax element, (c) reads all `getBoundingClientRect` first, then writes. IntersectionObserver (`threshold:.35`, once) adds `.in` to `.rv/.hl/[data-stagger]/[data-odo]/[data-ring]/[data-ledger]`. Pointer effects are skipped when `matchMedia('(hover:none)')` or `prefers-reduced-motion` matches.

### Tier A — AMBIENT (always on, sub-pixel, never demands attention)
| Class | Behavior |
|---|---|
| `--light` clock | Drives every `.chrome`/`.chrome-dark` (`background-size:220% 100%; background-position: calc(var(--light)*100%) 0`), `.iu-holo`, `.iu-panel`, `.seam::after`, `.btn-primary.is-hero` sheen, `.shine-band`. One light crosses the whole page. Reduced-motion: frozen at .5. |
| `.seam::after` | 30%-wide white→transparent band positioned by `--light` (translateX -100%→400%). |
| `[data-float]` | `@keyframes float 9s ease-in-out infinite` on `.card-stage`: `translateY(0,-14px,0) rotateZ(-2deg,2deg) rotateY(-6deg,6deg)`; `animation-play-state:paused` while pointer inside. |
| `.ticker-track` | `translateX(0→-50%) 38s linear infinite`; pauses on hover/focus-within. |
| `.seal` | `rotate 60s linear infinite`; pauses on hover. |
| `.shine-band` | trust-strip: `translateX(-120%→220%)` every 8s, `mix-blend-mode:screen`. |
| `.tier-2` glow | `box-shadow` opacity breathe 6s via a `::before` layer's opacity (not box-shadow animation). |
| `.pill-live` dot | opacity pulse 2s. |
| Chrome swipe (page load) | `.swipe` 5px fixed top bar `clip-path: inset(0 100% 0 0)→inset(0)` 520ms then fades; content never blocked. |

### Tier B — SCROLL (one-time reveals via IO; nothing fades-only)
| Class | Behavior |
|---|---|
| `.hl` headline unmask | JS wraps each line in `.hl-line > .hl-inner`; inner starts `translateY(110%) rotate(2deg)` → identity 800ms `--ease-out`, lines stagger 80ms; the `.flourish` word reveals last via `clip-path: inset(0 100% 0 0)→inset(0)` 600ms, then `--light` passes it. |
| `.rv` reveal | `opacity:0; translateY(24px) rotate(-1deg) scale(.98)` → identity 700ms `--ease-out`; `transition-delay: calc(var(--i)*70ms)` inside `[data-stagger]`. |
| `.odo` odometer | JS builds per-digit `.odo-d` (1em tall, overflow hidden) with a 0–9 strip; `translateY(calc(-1em*n))` 1.1s `--ease-roll`, columns staggered 90ms from the right; `.is-done` adds a 500ms `text-shadow: 0 0 24px rgba(255,255,255,.9)` pulse. Original text stays in DOM as `aria-label`. Only numbers already in copy. |
| `[data-ring]` | `.ring-fill` `stroke-dashoffset` full→value 1.4s `--ease-out`; `.ring-trail` 200ms later; `.score-word` crossfades at 580/670/740; `.score-delta` pops `scale(.8→1)` `--ease-spring` at completion. |
| `[data-ledger]` | Rows get `.is-struck` sequentially 140ms apart: strike 260ms → text dims → `.stamp` `scale(1.6→1)` opacity 0→1 220ms `--ease-spring`; `.ledger-total .odo` increments in sync. |
| `.rail` puck | Steps grids sit on a 2px `#26272B` rail; `.rail-puck` 14px chrome disc `translateX` along it from the steps container's scroll progress; each `.step-num` brightens (.4→1) as passed. Vertical on mobile. |
| `.wipe` comparison table | ImproveU cell `translateX(-24px→0)` + chrome underline `scaleX`; Typical cell struck 300ms later; rows 160ms apart. |
| `[data-parallax="-30"]` | `translateY(calc(var(--p)*Npx))` from scroll progress (cutouts −30, watermarks +18, ±6px pointer drift). |
| `.fan` | Card stacks fan on reveal: children `rotate(-8deg/0/8deg) translateX(-38%/0/38%)` 900ms `--ease-out`; hover widens to ±12°. |
| `.nav.scrolled` | after 40px: background/blur/hairline fade 300ms; logo gets one chrome sweep. |

### Tier C — HOVER / POINTER (micro, ≤300ms in, springs out)
| Class | Behavior |
|---|---|
| `[data-mag]` (auto on `.btn` outside `.nav`, forms, embeds) | within 60px pad: `translate3d(dx*.28px,dy*.28px,0) rotate(calc(dx*.04deg))`, `.btn-label` counter-translates ×.12; leave springs 500ms `--ease-spring`. |
| `.btn::before` shine | chrome band 30% wide `skewX(-20deg)`, `translateX(-160%→160%)` 600ms on hover. |
| `[data-tilt]` | maps pointer to `--mx/--my`; `rotateX(calc(var(--my)*-14deg)) rotateY(calc(var(--mx)*18deg))` (hero); ±8° mini/pricing; ±5° team; shadow plane counter-moves; glare follows. |
| `.vault` spotlight | `.vault::before` 640px `radial-gradient(rgba(255,255,255,.07), transparent 60%)` + inner 180px `.04` core, positioned with `transform: translate3d(var(--sx),var(--sy),0)`; `pointer-events:none`; touch → slow 20s drift keyframe. Never on sections taller than 1200px (split them). |
| `.review-card` | rest at `rotate(var(--tilt))`; hover `rotate(0) translateY(-6px)` + chrome hairline, 260ms; stars glint once (`--light` offset). |
| `.card`, `.blog-row`, `.team-card` | lift −6px + ≤.6° rotate; rim brightens; blog row slides a chrome "Read →" pill in from the right edge. |
| Links | `::after` 1px chrome underline `scaleX(0→1)` 220ms, origin left; focus-visible identical. |
| `.trust-logos img` | opacity .7→1, −2px. |

### Tier D — SIGNATURE (exactly one per page, §6). Composed only from A–C primitives.

Global timing law: reveals 700–800ms `--ease-out`; rolls 1.1–1.4s `--ease-roll`; stamps/pops 220ms `--ease-spring`; hover in ≤300ms, out 500ms spring. Nothing loops faster than 2s except the loading ring.

---
## 6. Page-by-page signature moments (19)

| Page | Moment (Tier D) | Rhythm notes |
|---|---|---|
| **index.html** | **The Deal.** Card starts face-down (`rotateY(180deg) translateY(40px)`), flips up 1.2s `--ease-out` at 200ms while "results" unmasks and the card's first number group rolls `0487→0781`; the `.score` ring beside/behind fills to 781 with the `+294` pop; the three `.dial-chip`s become `.pill-chrome` tilted mini-cards orbiting at .3/.5/.7 of the tilt. Then everything settles to ambient. | hero white → seam → trust strip → ticker → seam → "What we remove" vault as a 12-row `.ledger` (struck under spotlight) → stat band vault → Meet James vault (team-card, james-hero-web) → How it works (white, rail puck) → SmartCredit vault → pricing vault (3 physical cards) → guarantee white → reviews mist → lead-band vault (qualifier) → follow white → CTA vault → footer |
| **credit-repair.html** | **The Hit List.** "What we remove" is a black-sheet `.ledger` of the 12 items struck + stamped in sequence with `Items removed 0→12`; then "Five phases" rail puck rides Analyze→Rebuild and phase 05 carries a mini `.score` rolling 487→781. Comparison table does the `.wipe`. | header white → vault ledger → white phases → vault "personally reviewed" (james-about-web parallax) → mist comparison → CTA |
| **business-funding.html** | **The Funding Fan.** Three `.iu-card.mini` (black/silver/blueprint) `.fan` out on reveal with funding types embossed; any dollar figures already in copy roll as `.odo`. | white header → vault fan → mist edge section → CTA |
| **homeowner-program.html** | **90-Day Ring.** A large `.score` variant with 90 tick marks (`stroke-dasharray`) fills as a mono day counter rolls 0→90; the three phase labels brighten as the ring passes them; guarantee `.seal` rotates beside it. | white → vault ring → white path (rail) → mist story → CTA |
| **pricing.html** | **The Showroom Floor.** Silver / Black / Blueprint tier cards stand on a mist floor with soft shadows; prices roll in as `.odo`; Tier 2 breathes white glow and pointer-tilts; hover slides its holo. Offer box = `.notice`. | white header → mist tiers → white "after enrollment" rail → CTA |
| **results.html** | **Before/After Wall.** Each `.score-card` is a two-column chrome card: "before" number gets struck (`.is-struck`), "after" rolls up with a mini ring, `.delta` stamps in as `.pill-chrome`; the ticker runs full-width between grids; reviews tilt-and-straighten. | white header → ticker → mist wall → white reviews → CTA |
| **about.html** | **Founder Watermark.** "JAMES" `.wordmark` (18vw, 6% opacity) behind james-about-web with opposite `[data-parallax]`; the cutout drifts ±6px to the pointer under a `.team-spot`; Joseph and Harley `.team-card`s reveal from either side with names unmasking; "8 years" `.odo` on the timeline. | white story → vault founder → mist team → white Fresno → vault values → CTA |
| **get-started.html** | **The Rep Hand.** The three Scorexer rep links (James, Joseph, Harley — hrefs untouched) are three `.iu-card.mini` fanned like a hand; hover brings one forward with the rep cutout rising behind it. Qualifier steps (if present) slide with the chrome `.q-progress` rail. | white header → vault hand → CTA |
| **book-a-call.html** | **Appointment Card.** Calendly embed set inside a white card with a chrome bezel (`.iu-rim` recipe) and rep chrome-disc avatars; the only motion is the bezel's `--light` sheen — the embed stays calm. Rep links = `.btn-ghost` (non-magnetic). | white → mist reps → white schedule → CTA |
| **portal.html** | **Card Reader.** `.iu-card.mini` "CLIENT PORTAL" floats in a vault hero; hovering/focusing the `.btn-primary` Login slides the card into a chrome reader slot (`clip-path` reveal of the slot, card `translateX`); the three rep Scorexer links are small tilted mini-cards. | vault hero → mist rep row → footer |
| **affiliate.html** | **Commission Counter.** An `.odo` commission example (figures from copy) climbs beside the preserved webform, which sits inside a `.vault` card with chrome hairlines; inputs get `.field` styling via wrapper only; submit button gets `.btn-primary` classes, `submitForm` untouched. | white → mist steps (rail) → white perks → vault form → footer |
| **franchise.html** | **The Territory Card.** `.iu-card` "FRANCHISE OWNER" does ONE slow full `rotateY(360deg)` 2.4s on reveal, showing the `.iu-back` (magstripe + "EST. FRESNO, CA" signature panel); wins ticker rebranded "Franchise wins" with existing copy. | white → vault card → mist "what you get" → white wins → mist rail → CTA |
| **faq.html** | **The Vault Opens.** Chrome-plus accordion: the open row turns black while its answer slides; first question open on load; a sticky mono index (desktop) highlights the current question with a sliding chrome puck. | white header → mist accordion → CTA |
| **blog.html** | **Ledger Press.** Posts as `.blog-row` ledger lines with mono index numbers; hover lifts the row and slides the chrome "Read →" pill in; the featured post is a vault card whose headline carries the shimmer word. | white header → mist ledger → CTA |
| **contact.html** | **The Phone Plate.** `(559) 900-9326` rendered as embossed chrome digits on a black plate (`.iu-number` recipe, `--light` pass, ±4° tilt) above the `data-form`; a `.pill-live` "OPEN NOW / CLOSED" badge computed in JS from Mon–Fri 9–6 PST; success block stamps "RECEIVED". Maps placeholder comment kept. | white header → vault plate → white form → CTA |
| **privacy-policy.html** | **Document mode.** `.page-head.doc` with mono header "DOC 01 · PRIVACY", sticky `.doc-toc` with chrome puck, one shimmer word in h1, headings `.hl` — nothing else moves. 68ch measure on mist paper. | mist paper → footer |
| **terms-of-service.html** | Same document system: "DOC 02 · TERMS". | mist paper → footer |
| **croa-disclosure.html** | "DOC 03 · CROA": rights as a `.ledger.rights` where each row reveals a chrome check drawing in; the 5-business-day cancellation right is a `.notice` vault callout — the one thing that draws the eye. | mist paper → footer |
| **cookie-policy.html** | "DOC 04 · COOKIES": document system; cookie table rows use `.rv` stagger only. | mist paper → footer |

---
## 7. Rules

**Reduced motion** (`@media (prefers-reduced-motion: reduce)`): all keyframes/transitions off; `--light` fixed .5; `.hl/.rv` start visible; `.odo` renders its final number (`data-odo`) instantly; `.ledger-row` renders struck + stamped; rings render at final `stroke-dashoffset`; card sits static at `rotateX(8deg) rotateY(-12deg)`; ticker becomes a wrapped static list; spotlight/tilt/magnetic/parallax off. Every page is complete and readable with motion off and with JS off (markup carries final text).

**Performance:** animate only `transform`, `opacity`, `clip-path`, `background-position`, `stroke-dashoffset`; `filter` only on `.iu-card-shadow` (static blur) and the ring glow; ONE `backdrop-filter` (nav). `will-change: transform` only on `.card-stage`, `.iu-card-shadow`, `.ticker-track`. One rAF loop, reads before writes, `passive` listeners, `contain: paint` on `.vault`. ≤6 shimmer-text elements and ≤2 `[data-tilt]` per viewport; odometers/ledgers init lazily on intersection; ambient animations pause off-screen via IO (`.is-offscreen` sets `animation-play-state: paused`). `@media (hover:none)`: no tilt/magnetic/spotlight (drift keyframe instead), card float only. Below 640px: h1 wdth 112, fan collapses to a stack, rail goes vertical.

**Accessibility:** semantic `h1→h2→h3` order per page; visible focus (`3px #FFFFFF` + `5px #0A0A0B` ring, works on both grounds); nav dropdowns and mobile menu keyboard-operable with `aria-expanded`, Esc closes, focus trapped; accordion buttons with `aria-controls`; decorative layers `aria-hidden`; odometer/ledger final values in DOM text or `aria-label`; ticker duplicated track `aria-hidden` + `.sr-only` list; card is `role="img"` with an "illustration" label, number never announced; alt text on all photos; contrast: body `#26272B`/white, `#C9CCD2`/black, labels `#8E9199` only on black, chrome text on white only via `.chrome-dark` at display sizes; never hide the native cursor.

**Palette discipline:** no hue anywhere — SVG gradients, stars, checks, focus rings, badges, notices, ring fills are greys only. State = intensity (dim `#B9BCC3` / solid / chrome / white glow). Grep the forbidden list in §1 before deploy.

**Copy & integrity:** tighten copy only; no new claims, prices, or numbers; illustrative scores are only those already present (487→781, +294, +142, +180 …). Phone `(559) 900-9326` everywhere incl. JSON-LD. Keep every URL, section, link, meta, schema.
