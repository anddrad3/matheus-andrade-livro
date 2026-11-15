# Matheus Andrade — the book

[🇧🇷 Português](README.md) · **🇺🇸 English**

Portfolio of **Matheus da Silva Andrade** — full stack developer, teacher and researcher — shaped as a **deluxe-edition book**, in Portuguese and English.

**Version 4.4.1** · full history in the [CHANGELOG](CHANGELOG.md) (in Portuguese).

🔗 **Live:** [matityahu.alwaysdata.net/dev-matheus-andrade](https://matityahu.alwaysdata.net/dev-matheus-andrade/) · [GitHub Pages](https://anddrad3.github.io/matheus-andrade-livro/)

On arrival, a **cutscene** lowers the camera onto the book lying on a desk — glasses, fountain pen, a note, a notepad, coffee (or a candle), a glass of whisky, a lighter, a phone and a cigarette in the ashtray (put out in the classic edition, smoking in the Dark one) — while the piano soundtrack begins. With a tap, the book levitates, spins in the air, the cover opens and the camera dives into the pages until a star of light reveals the **table of contents**.

The site follows the **visitor’s device**: light theme → classic edition, dark theme → Dark Edition; Portuguese → the book in Portuguese, any other language → English. Both can be switched at any time (theme button and the **PT ⇄ EN** switch at the top).

## Two editions

| | Classic (light theme) | Dark Edition (dark theme) |
|---|---|---|
| Cover | Brown leather, gold leaf, guilloché medallion | Black leather, silver, Dürer’s engraved skull, *Nevermore* |
| Pages | Aged cream paper, gilded edges | Bone paper, black chapter openers, black edges |
| Desk | Warm wood, coffee ring, cigarette put out | Ebony, red-wax candle, lit cigarette |
| Soundtrack | Bach’s *Air* on piano | Mozart’s *Lacrimosa* on piano |
| Desk phone | Light app, cover with Doré’s **Paradiso** | Dark app, cover with Doré’s **Inferno** |
| Objects | Cheerful lines, they call the owner **Matheus** | Grim-but-funny lines, they call the owner **Andrade** |

## Chapters

| | Chapter | Contents |
|---|---|---|
| § | Prologue | Who writes: bio, education and catalogue record |
| I | Arsenal | Languages, interfaces, back-end, maps & AI, craft |
| II | Works | Ameríndia, Voz do Professor, MLG, BloqueiaShorts and CNPJ Escolas |
| III | Education | From ETEC to UNESP, undergraduate research and the next chapter: a master’s degree |
| § | Epilogue | Contact letter, ink signature and a **logbook** with live commits from GitHub |
| — | Colophon · Index | Typographic credits and a clickable index |

## Interactions

- **Turning pages**: **click the page** (right goes forward, left goes back; on a phone, tap — the left third goes back) or drag it from anywhere: the leaf is **malleable**, lifted from the bottom or the top, and bends like paper. Also: arrow keys, the tabs or the contents page.
- **Pages written before your eyes**: text appears word by word and pictures are drawn each time a page opens.
- **Visit the work** (or click the photo): the camera dives into the website plate and the site opens in a new tab.
- **360° mode**: on desktop, drag outside the book to rotate it and, facing you, drag the page to turn it; on a phone, drag anywhere (including over the book). “Back to the book”, Esc or double click to leave.
- **Desk objects**: click and the object opens in a card you can rotate 360° (with smooth inertia), with 3 lines per object and per theme.
- **Desk phone**: opens a music app showing the edition’s track, a note about it and a Doré engraving from the *Divine Comedy* as cover art; pause, restart, scrub, volume, page sounds and switching editions.
- **Zoom**: on desktop, the **mouse wheel** zooms in and out around the cursor (also trackpad pinch and the `+` `−` `0` keys); on a phone, pinch. When zoomed in, drag to move around the page.
- **Language**: the **PT ⇄ EN** switch at the top — the whole book (pages, objects, phone, buttons) changes language.
- **Soundtrack from the first moment**: if the browser already allows sound, the opening starts playing; if not (browser rule: sound only after a tap), the monogram asks “tap to open the book ♪” and that tap starts the music and the scene together.
- **Replay the opening** (the music restarts with it) at any time; **M·A** closes the book on its cover.
- **Phone**: one page at a time with the objects on the desk around it; swipe to turn; the **“2 pages”** button shows both (with the phone upright, the book lies down on the screen — just turn the device); book tabs for the chapters; a **bottom bar** with theme, music, page sounds, 360° and opening.

## Performance

- No layout shift on load (CLS 0): the stage only appears once measured; images have `width`/`height`.
- First paint depends on neither JavaScript, external fonts nor the main CSS: the entry screen’s style is inlined in the HTML and the main CSS loads without blocking (plugin in `vite.config.js`); Google Fonts don’t block either.
- Only the language in use is downloaded (`content.pt.js` or `content.en.js`); the desk phone, the object card and the logbook load only when used; opening textures are preloaded from `<head>`.
- Page turns no longer recalculate the style of hundreds of words every frame; the incoming page is written only after the leaf settles (nothing is painted mid-turn); the cast shadow and the paper curve only move GPU layers.
- No filter recomputed by the GPU every frame: no blur on the scene-change flash or the background light beam; object shadows kept off animated layers.
- Images and soundtrack cached for a year (`public/.htaccess`); soundtracks as 80 kbps mono MP3; the other theme’s engravings and the GitHub logbook only load when needed.

## Editing the content

Text lives in [`src/content.pt.js`](src/content.pt.js) (Portuguese) and [`src/content.en.js`](src/content.en.js) (English) — same structure in both. Fixed strings in pages and UI use `t('português', 'English')` (`src/lang.js`).

## Running locally

```bash
npm install
npm run dev
```

Changed a texture’s colours in `src/textures.js`? Regenerate the WebP files (needs Edge or Chrome installed):

```bash
npm run textures
```

## Publishing

- **GitHub Pages:** every push to `main` deploys via GitHub Actions (`.github/workflows/deploy.yml`).
- **alwaysdata:** `npm run deploy` builds and uploads over SSH (`scripts/deploy-alwaysdata.mjs`).

## Stack

Vite · vanilla JavaScript · GSAP · CSS 3D transforms · procedural SVG · Canvas 2D · Web Audio
Typefaces: Cormorant Garamond, EB Garamond, Pinyon Script, Caveat, Pirata One and Cinzel.

## Media credits

- **Engravings (light theme)** — Albrecht Dürer, *Saint Jerome in His Study* and *Melencolia I* (1514, CC0, Metropolitan Museum of Art); Flammarion engraving, *L’atmosphère* (1888); Jost Amman, the printer’s workshop (1568). Public domain.
- **Engravings (dark theme)** — Gustave Doré, illustrations for E. A. Poe’s *The Raven* (1884). Public domain, via Wikimedia Commons.
- **Music app covers** — Gustave Doré, illustrations for Dante’s *Divine Comedy*: *Paradiso*, Canto XXXI, the Celestial Rose (1868), and *Inferno*, Canto XXXIV, Lucifer (1861). Public domain, via Wikimedia Commons.
- **Dark Edition skull** — *Coat of Arms with a Skull*, Albrecht Dürer (1503). Public domain (CC0), Metropolitan Museum of Art.
- **Light theme soundtrack** (`public/music/aria-bach-piano.mp3`) — *Air* from Orchestral Suite No. 3, BWV 1068, J. S. Bach. Bach-Gesellschaft score from the [Mutopia Project](https://www.mutopiaproject.org/) (CC BY-SA 3.0), rendered on the sampled [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3) by Alexander Holm (CC BY 3.0). The resulting audio is distributed under CC BY-SA 3.0.
- **Dark theme soundtrack** (`public/music/lacrimosa-piano.mp3`) — *Lacrimosa* from the Requiem K. 626, W. A. Mozart, in S. Thalberg’s transcription (Op. 70, No. 5A), performed by Lệ Xuân — [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Mozart,_Requiem_in_D_minor,_%27Lacrimosa%27_%E2%80%93_piano_arrangement.ogg), CC BY-SA 4.0. Converted to MP3.
