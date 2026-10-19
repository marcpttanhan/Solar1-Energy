# Solar One Energy (solar1)

Static marketing site for a Thai solar installer (HQ Nakhon Pathom). Plain HTML/CSS/JS, no build step and no package.json.
Content can be overridden from Supabase through the admin panel.

- `index.html`, `styles.css`, `main.js`: the public site (Thai, `lang="th"`, Anuphan variable font)
- `admin.html`, `admin.css`, `js/admin.js`: Supabase-backed admin panel. `js/content.js` applies `data-c="…"` overrides
- `supabase-config.js`: public URL + anon key only (never the service_role key). `supabase_schema.sql`: tables and RLS
- Deploy: GitHub `marcpttanhan/Solar1-Energy` → Vercel auto-deploys `main` (live at solar1-energy.vercel.app). `.vercelignore` keeps `.claude/`, `deploy/` and the SQL files out of the build. The repo root is the web root: `robots.txt`, `sitemap.xml`, `favicon.*` live there. Don't add a `public/` folder (Vercel would deploy only that folder). Security headers are set for every path in `vercel.json`
- Local preview: `.claude/launch.json` has `solar1` (port 8080, attaches to `python3 .claude/serve.py 8080`) and `solar1-node` (port 8081, runs `node .claude/serve.mjs`, for machines without Python such as the Windows VPS). Both support Range requests for video seeking

## Design skills (project-local, in `.claude/skills/`)

- **frontend-design** (Anthropic, `anthropics/claude-code`): sets the visual direction. Use it for new sections or any change to the look of a page.
- **ui-ux-pro-max** (`nextlevelbuilder/ui-ux-pro-max-skill`): UX/accessibility rules. Use it for reviews, components, forms, motion, and responsive work.
  The full rule list is in `references/quick-reference.md`. For this stack, search with `--stack html-tailwind` for plain-HTML patterns only. The site does not use Tailwind.
  The search script needs Python 3, which this VPS doesn't have yet. Until it's installed, read `references/` and `data/*.csv` directly.

When the skills disagree, the existing design system wins. The site has a defined direction, so new work extends it instead of restyling it:
- "Cool drafting paper": `--paper #F3F5F7`, graphite ink `#22272C`. Brand orange `#FC571F` is used sparingly. A dark theme sits under `[data-theme="dark"]`
- Use the tokens in `:root`. Don't put raw hex values in new rules. Radii are `--r-panel 20px` / `--r-card 12px` / `--r-pill`, and the easing is `--ease`
- Breakpoints: 1100 / 1024 (tablet) / 899 (nav CTA hides so the links stay on one line) / 767 / 639 (phone). Both `prefers-reduced-motion` blocks must cover any new motion
- Filled buttons use `--cta` / `--cta-deep` (white text at 4.8:1 / 6:1). Keep `--orange` for accents, rules and large numerals, not behind small white text
- Text is 14px minimum (Thai script gets hard to read below that)
- Motion is additive only: never hide content in a resting style (no `opacity: 0` waiting for JS or an observer). Entrance/scroll effects are one-shot CSS animations (styles.css "entrance and scroll motion", `playOnce` in main.js) that end at the visible state, with timeout watchdogs

## Content (from the company profile PDF, 2026-10-17)

- Site sections, in order: hero, เกี่ยวกับเรา (`#impact`, four figures), แพ็กเกจ, คำนวณความคุ้มค่า, ผลงาน (`#projects`), footer/contact. The old placeholder reviews section was replaced by the real portfolio.
- `site_content` keys: `hero`, `packages`, `roi`, `contact`, `projects`. `projects` holds `stats` (exactly 4), `items` (portfolio; the first `featured` item gets the large card; `year` is Buddhist-era, 0 = hidden; `savingUpTo` shows the top of a range as "สูงสุด") and `clients` (logos). Built-in defaults in `js/content.js` mirror the PDF; `supabase_content_seed.sql` loads them into Supabase.
- SEO: `index.html` has static LocalBusiness JSON-LD and Open Graph tags. Crawlers don't run the Supabase overrides, so the static HTML, the JSON-LD and the `js/content.js` defaults must match what Supabase serves (hero subtitle, contact, hours Mon–Sat 08:00–17:00). Change all three together. The JSON-LD `geo` is approximate (Central Salaya); replace it with the exact HQ pin when known.
- Private customers are listed as "บ้านพักอาศัย" with district/province only (no names or house numbers), even though the PDF shows them.
- Images: `Media/projects/` (WebP ≤1200 px), `Media/clients/`, `Media/brands/`, `Media/certs/`, `Media/awards/`, and slot photos in `Media/packages/` (listed in `Media/images.json`). See `Media/README.md`.
- Not in the PDF, so still placeholders: package prices and specs, the 3-day survey promise in the footer, Facebook URL (the PDF gives only the page name).

## Supabase and admin sign-in

- Admin sign-in is Supabase Auth. There is no link to it from the public site. Open `/admin.html` directly. Typing the username `admin` (or `solar1`) there signs in as `adminEmail` from `supabase-config.js` (`admin@solar1energy.co.th`). The password lives only in Supabase, never in the repo.
- Write access is enforced by RLS in `supabase_schema.sql`: only a JWT with that email can insert, update or delete `site_content`. If you change the admin email, change it in both files. There is no `admin_users` table or `is_admin()` anymore.
- Public sign-ups must stay off (Authentication → Sign In / Providers).
- The live project had a mismatched `site_content` table. `supabase_fix.sql` was run on 2026-10-16: the old table is kept as `site_content_legacy_*`, and the live table and policies now match `supabase_schema.sql`. Admin sign-in and saving were verified end to end (a calculator change showed on solar1-energy.vercel.app). The old `admin_users` / `*_legacy*` tables are unused and can be dropped.

## UX/design audit (2026-10-16)

Fixed: CTA contrast (`--cta`), 12–13px text raised to 14px, skip link to `#content`, footer `h5` changed to `h3`,
benefit numbering removed, `XX` placeholders replaced with confirmed-only fallbacks
(street address and phone are set from the admin panel), the privacy-policy line removed until a page exists, and the hero video
gets `preload="metadata"` plus `Media/hero-poster.jpg` (JS starts playback, so reduced-motion/save-data visitors
download only the 86 KB poster).

Still open:
- Kicker labels sit above most section headings. They mirror the nav labels, so they were kept as wayfinding. Revisit if the design gets refreshed.
- `hero.mp4` is 3.8 MB at 1280×720. A smaller mobile encode needs ffmpeg. The font preload is a 215 KB TTF, and WOFF2 needs fonttools (Python).
- No privacy policy page. One is needed before any form that collects personal data (PDPA).
