# Solar One Energy (solar1)

Static marketing site for a Thai solar installer (HQ Nakhon Pathom). Plain HTML/CSS/JS, no build step and no package.json.
Content can be overridden from Supabase through the admin panel.

- `index.html`, `styles.css`, `main.js`: the public site (Thai, `lang="th"`, Anuphan variable font)
- `admin.html`, `admin.css`, `js/admin.js`: Supabase-backed admin panel. `js/content.js` applies `data-c="…"` overrides
- `supabase-config.js`: public URL + anon key only (never the service_role key). `supabase_schema.sql`: tables and RLS
- Deploy: GitHub `marcpttanhan/Solar1-Energy` → Vercel auto-deploys `main`. `.vercelignore` keeps `.claude/` and `deploy/` out of the build
- Local preview: `.claude/launch.json` has `solar1` (port 8080, attaches to `python3 .claude/serve.py 8080`) and `solar1-node` (port 8081, runs `node .claude/serve.mjs`, for machines without Python such as the Windows VPS). Both support Range requests for video seeking

## Design skills (project-local, in `.claude/skills/`)

- **frontend-design** (Anthropic, `anthropics/claude-code`): sets the visual direction. Use it for new sections or any change to the look of a page.
- **ui-ux-pro-max** (`nextlevelbuilder/ui-ux-pro-max-skill`): UX/accessibility rules. Use it for reviews, components, forms, motion, and responsive work.
  The full rule list is in `references/quick-reference.md`. For this stack, search with `--stack html-tailwind` for plain-HTML patterns only. The site does not use Tailwind.
  The search script needs Python 3, which this VPS doesn't have yet. Until it's installed, read `references/` and `data/*.csv` directly.

When the skills disagree, the existing design system wins. The site has a defined direction, so new work extends it instead of restyling it:
- "Cool drafting paper": `--paper #F3F5F7`, graphite ink `#22272C`. Brand orange `#FC571F` is used sparingly. A dark theme sits under `[data-theme="dark"]`
- Use the tokens in `:root`. Don't put raw hex values in new rules. Radii are `--r-panel 20px` / `--r-card 12px` / `--r-pill`, and the easing is `--ease`
- Breakpoints: 1100 / 1024 (tablet) / 767 / 639 (phone). Both `prefers-reduced-motion` blocks must cover any new motion
- Filled buttons use `--cta` / `--cta-deep` (white text at 4.8:1 / 6:1). Keep `--orange` for accents, rules and large numerals, not behind small white text
- Text is 14px minimum (Thai script gets hard to read below that)

## Supabase status (2026-10-16)

The URL and anon key in `supabase-config.js` are valid, but the database doesn't match `supabase_schema.sql`:
`site_content` has no `key` column, and an `admin_users` policy recurses ("infinite recursion detected in policy").
Until the schema is reset in the Supabase SQL editor, the site serves its built-in content (by design) and admin login can't load content.

## UX/design audit (2026-10-16)

Fixed: CTA contrast (`--cta`), 12–13px text raised to 14px, skip link to `#content`, footer `h5` changed to `h3`,
`.admin-dot` given a 24px hit area, benefit numbering removed, `XX` placeholders replaced with confirmed-only fallbacks
(street address and phone are set from the admin panel), the privacy-policy line removed until a page exists, and the hero video
gets `preload="metadata"` plus `Media/hero-poster.jpg` (JS starts playback, so reduced-motion/save-data visitors
download only the 86 KB poster).

Still open:
- Kicker labels sit above most section headings. They mirror the nav labels, so they were kept as wayfinding. Revisit if the design gets refreshed.
- `hero.mp4` is 3.8 MB at 1280×720. A smaller mobile encode needs ffmpeg. The font preload is a 215 KB TTF, and WOFF2 needs fonttools (Python).
- No privacy policy page. One is needed before any form that collects personal data (PDPA).
