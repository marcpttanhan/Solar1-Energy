# Solar One Energy (solar1)

Static marketing site for a Thai solar installer (HQ Nakhon Pathom). Plain HTML/CSS/JS, no build step and no package.json.
Content can be overridden from Supabase through the admin panel.

- `index.html`, `styles.css`, `main.js`: the public site (Thai, `lang="th"`, Anuphan variable font)
- `admin.html`, `admin.css`, `js/admin.js`: Supabase-backed admin panel. `js/content.js` applies `data-c="…"` overrides
- `supabase-config.js`: public URL + anon key only (never the service_role key). `supabase_schema.sql`: tables and RLS
- Deploy: GitHub `marcpttanhan/Solar1-Energy` → Vercel auto-deploys `main`. `.vercelignore` keeps `.claude/` and `deploy/` out of the build
- Local preview: `.claude/launch.json` (`solar1`, port 8080) attaches to `python3 .claude/serve.py 8080`, which supports Range requests for video seeking

## Design skills (project-local, in `.claude/skills/`)

- **frontend-design** (Anthropic, `anthropics/claude-code`): sets the visual direction. Use it for new sections or any change to the look of a page.
- **ui-ux-pro-max** (`nextlevelbuilder/ui-ux-pro-max-skill`): UX/accessibility rules. Use it for reviews, components, forms, motion, and responsive work.
  The full rule list is in `references/quick-reference.md`. For this stack, search with `--stack html-tailwind` for plain-HTML patterns only. The site does not use Tailwind.
  The search script needs Python 3, which this VPS doesn't have yet. Until it's installed, read `references/` and `data/*.csv` directly.

When the skills disagree, the existing design system wins. The site has a defined direction, so new work extends it instead of restyling it:
- "Cool drafting paper": `--paper #F3F5F7`, graphite ink `#22272C`. Brand orange `#FC571F` is used sparingly. A dark theme sits under `[data-theme="dark"]`
- Use the tokens in `:root`. Don't put raw hex values in new rules. Radii are `--r-panel 20px` / `--r-card 12px` / `--r-pill`, and the easing is `--ease`
- Breakpoints: 1100 / 1024 (tablet) / 767 / 639 (phone). Both `prefers-reduced-motion` blocks must cover any new motion

## Open UX/design findings (audit against both skills, 2026-10-16)

Not yet fixed. Verify each before changing anything.

1. Contrast: white text on `--orange` (#FC571F) is about 3.2:1. That's below AA 4.5:1 for button-size text (`.btn--orange`), and it's the main CTA.
2. Small text: several labels are 12px (`.hero-card p`, `.chip`, `.field-hint`, `.chart-cap`, `.chart-axis`, `.pk-specs dt`). Thai script at 12px is hard to read. Aim for 14px or more.
3. No skip link to `<main>`. The footer columns use `<h5>` right after `<h2>` (skips heading levels).
4. `.admin-dot` in the footer is a tiny link target. It needs at least 24×24px to meet WCAG 2.2 target size, or it should be removed from the public page.
5. The benefits accordion uses `01/02/03` numbering, but its items aren't a sequence (a frontend-design "tell"). Kicker labels sit above almost every heading. Review whether each one earns its place.
6. Placeholder content is still live: the footer address and phone (`XX`) and "นโยบายความเป็นส่วนตัว" (the privacy policy line) is plain text, not a link.
7. Performance: `Media/hero.mp4` is 3.8 MB with `preload="auto"`. Consider a smaller mobile encode and a `poster`. The font preload is a 215 KB TTF; WOFF2 would be about 3× smaller.
