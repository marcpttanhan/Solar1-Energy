# Media

Images come from the company profile PDF (Solar1energy co.,ltd, 2026), cropped
and converted to WebP (photos max 1200 px wide, logos max 200 px tall).

- `logo-mark.png` transparent brand mark for the navbar (white background removed
  from `logo-trim.png`, which the footer and admin still use)
- `projects/` portfolio photos, one per installation (referenced from the
  `projects` content in js/content.js or the admin panel)
- `clients/` client logos (transparent or white background; shown on white tiles)
- `brands/`, `certs/`, `awards/` equipment brands, Q CELLS certifications and
  the SolarEdge Award of Excellence (static in index.html)
- `packages/` package photos, real installations of a similar size

Package photos are slot-based: drop a file at one of these paths and list it in
`images.json`. Until a path is listed, its frame shows the built-in line drawing
and nothing is requested from the server.

- Media/packages/home-5kwp.jpg
- Media/packages/home-hybrid-10kwp.jpg
- Media/packages/business-30kwp.jpg
- Media/packages/factory-100kwp.jpg
- Media/packages/factory-300kwp.jpg
- Media/packages/factory-1mwp.jpg

With a package photo present, it replaces the card's drone clip (the clip only
shows for packages without a photo).

## Sizes and caching

- Portfolio photos also ship as 4:3 crops `<name>-480.webp` and `<name>-800.webp`;
  package photos as `<slot>-640.webp` and `<slot>-800.webp`. The site picks one
  with srcset and falls back to the original if a variant is missing, so a new
  photo works without them (it just downloads the full file).
- `logo-mark.webp` (navbar, PNG fallback) and `logo-footer.webp` are small copies
  of the logos sized for where they appear.
- vercel.json caches everything under Media/ and Font/ for a year (`immutable`),
  except images.json. Browsers won't re-download a changed file at the same path,
  so give a replaced image a new filename.
