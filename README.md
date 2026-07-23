#Proposal Website

## How to run it
Just open `index.html` in a browser — no build step, no server needed.

## Music
`assets/music.mp3` is already in place and wired to the mute/unmute button
top-right. Browsers block autoplay with sound, so it only starts the first
time she taps the speaker icon (or opens the envelope) — that's expected
behavior, not a bug. To swap the track, just replace `assets/music.mp3`
with another file of the same name.

## Deploying
- **GitHub Pages**: push this folder to a repo, enable Pages on the `main`
  branch, done.
- **Netlify / Vercel**: drag-and-drop the whole `proposal-site` folder into
  their dashboard, or connect the repo. No build command needed — it's
  static HTML/CSS/JS.

## Structure
```
proposal-site/
  index.html      → all 9 pages/chapters
  css/style.css   → theme, layout, all animations
  js/script.js    → page transitions, dodge-button logic, particles, finale
  assets/         → put music.mp3 here (and any photos you want to swap in)
```

## Making it yours
- Swap any 🌴🌽🏮 emoji placeholders in `index.html` for real photos of the
  two of you — replace the emoji span with an `<img>` and adjust sizing in
  the matching CSS rule (e.g. `.corn-stall`, `.bike-couple`).
- All the text from your brief is already in place word-for-word.
- Colors, fonts, and the firefly cursor trail are defined at the top of
  `style.css` under `:root` and `#firefly-canvas` if you want to retune them.
