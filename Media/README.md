# Media

Images come from the company profile PDF (Solar1energy co.,ltd, 2026), cropped
and converted to WebP (photos max 1200 px wide, logos max 200 px tall).

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

With a package photo present, the photo shows by default and the drone clip
plays over it on hover.
