# Kishan Deka — Research & Engineering

A professional static portfolio connecting computational cosmology with applied data science. Includes research and industry project pages, a filterable simulation carousel, an accessible native-dialog lightbox, publications, About/CV, and contact pages.

## Run locally

Requirements: Node.js 22+ and Python 3 for the optional local server. There are no npm dependencies and no install step.

```bash
npm run build
npm run check
npm run preview
```

Open http://localhost:8080. Use a server rather than opening HTML files directly: the gallery loads JSON using fetch. Stop with Ctrl+C. Rebuild after editing content or the page templates. CSS and gallery JavaScript live directly in `dist/assets` and do not require rebuilding. **Do not delete dist:** it contains authored assets as well as generated HTML.

## Project structure

- `content/profile.json`: identity, description, contact links, CV paths, origin, and base path.
- `content/projects.json`: research and industry entries, sections, statuses, and links.
- `content/publications.json`: publications and talks.
- `content/gallery.json`: ordered media entries. The supplied entries are explicit placeholders, not scientific results.
- `scripts/build.mjs`: reusable HTML layout, card and page components; writes real directory-index pages.
- `scripts/check.mjs`: validates generated local links and gallery references.
- `dist/assets/style.css`: visual design and responsive styles.
- `dist/assets/gallery.js`: carousel, keyboard/touch support, filtering, video pausing, and modal.
- `dist/assets/media/`: place original media, posters, and optimized thumbnails here.
- `dist/`: published site; commit it alongside the generator and content.
- `.github/workflows/pages.yml`: builds, checks, and deploys to Pages on main.

## Publish on GitHub Pages

1. Create a GitHub repository named `YOUR_USERNAME.github.io` for a user site, or choose another repository name for a project site.
2. Upload the contents of this source folder, including `.github`, to the repository's `main` branch. The source ZIP excludes internal preview configuration.
3. In Settings → Pages → Build and deployment, choose **GitHub Actions**.
4. Set `siteUrl` in `content/profile.json` to your origin, e.g. `https://YOUR_USERNAME.github.io` (no repository path). For local project-subpath checks, set `basePath` to `/REPOSITORY_NAME`; otherwise leave it empty. The workflow automatically uses the base path returned by GitHub Pages.
5. Push to main, or run the workflow manually from Actions. Check the deployment result there.

Reference: [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Each detail page is an actual `projects/ID/index.html`, so direct links and refreshes do not require SPA rewrite rules. The GitHub deployment is not performed by downloading this project; you must upload it to your own repository.

## Update profile, contact links, and CVs

Edit `content/profile.json`. Leave unavailable fields `null`; the site renders an honest unavailable state rather than a broken link. `email` is a bare email address; GitHub, LinkedIn, and scholar fields are complete HTTPS URLs.

Place PDFs at `dist/assets/academic-cv.pdf` and `dist/assets/industry-resume.pdf`, then set `academicCV` to `assets/academic-cv.pdf` and `industryResume` to `assets/industry-resume.pdf`. Rebuild. Download links appear only when a path is configured. `siteUrl` enables canonical and Open Graph URL metadata; page titles and descriptions are always generated. An Open Graph image is intentionally omitted until a real share image is supplied.

## Add a project

Copy an entry in `content/projects.json`. Give it a unique lowercase, hyphen-separated `id`, use `category: "research"` or `"industry"`, and set its title, summary, status, tags, and ordered `sections` object. The listing, detail route, and appropriate navigation state are generated automatically. New projects also enter the corresponding home selection up to its displayed limit. Do not rename existing IDs without considering external links.

Add links in this shape:

```json
"links": [{"label": "Source code", "url": "https://github.com/YOUR_USERNAME/YOUR_REPOSITORY"}]
```

Keep work in progress labeled. Publish numerical results only with a verified evaluation and supporting evidence. Current text describes research scope and intended project work; it does not claim unverified benchmark results.

## Add a figure, GIF, or video

1. Copy the asset into `dist/assets/media/`.
2. Add or replace an entry in `content/gallery.json` using this example:

```json
{
  "id": "foreground-comparison",
  "title": "Foreground residual comparison",
  "project": "foregrounds",
  "label": "CMB FOREGROUNDS",
  "category": "CMB",
  "type": "image",
  "src": "assets/media/foreground-comparison.webp",
  "thumbnail": "assets/media/foreground-comparison-thumb.webp",
  "poster": null,
  "alt": "Describe the panels, axes, quantities, and visually important result.",
  "caption": "Describe what this figure shows, including units and simulation assumptions."
}
```

Use `image` for static images, `gif` for GIFs, and `video` (or `mp4`/`webm`) for videos. MP4 and WebM are handled through the native video element. Supply a static `poster` for videos and GIFs, especially for reduced-motion visitors. Use small static WebP/JPEG/PNG thumbnails; never use the full GIF as its thumbnail. Prefer video for large animations to reduce transfer size. Convert media with your preferred scientific export or video tooling; no automatic transcoding is performed.

The array order determines slide order. Filters are derived automatically from `category`. `project` must match an existing project ID. Paths are relative to dist and get the deployment subpath automatically. The main asset is loaded only for the selected slide; thumbnails are lazy-loaded. Native videos expose controls, use metadata preloading, and pause when the gallery leaves view, the tab is hidden, a slide changes, or the lightbox closes. GIFs cannot be paused like videos; reduced-motion mode shows a poster or a click-to-play placeholder until explicitly opened.

Click a figure to enlarge it, or use Enlarge on a video. Escape closes the dialog and restores focus. Use left/right arrows while focused in the gallery, touch swipe on non-video media, or the previous/next and thumbnail buttons. No automatic slide advancement occurs. The separate Explore project link opens its detail page. Media uses `object-fit: contain` so axes and legends remain visible.

If no media is available yet, leave `type: "placeholder"` and `src: null`. These are intentional labeled slots, not fabricated figures. Project pages link to the complete media gallery.

## Add publications and talks

Populate the arrays in `content/publications.json`. Both use entries such as:

```json
{
  "title": "Verified title",
  "authors": "Verified author list",
  "year": "2026",
  "venue": "Journal or conference name",
  "status": "Preprint / Published / Talk / Poster",
  "url": "https://VERIFIED_LINK"
}
```

Do not paste example URLs literally. Leave `url` null if unavailable. The page clearly marks empty publication and talk lists.

## Design and accessibility

Light paper background, navy typography, muted teal accent, editorial serif headings, restrained borders, and scientific-media-first presentation. Main layouts switch at 1050px and 760px. Keyboard focus is visible; semantic landmarks and a skip link are included. The lightbox uses native dialog focus containment. Large media has a stable stage size and uses contain sizing. Fonts are system fonts, requiring no external requests.

## Verification and remaining review

- Generation completed successfully for 14 pages plus the 404 document.
- Local navigation/asset references, unique project IDs, and gallery metadata passed checks at `/` and `/portfolio-test`.
- Gallery JavaScript passed syntax checking.
- Responsive breakpoints and interaction handlers were reviewed in source. Browser visual QA, touch gestures, screen-reader behavior, and real-media playback have **not** been exercised in this environment.
- GitHub Actions deployment must be run in your GitHub repository; it has not been run here.
- Original graphics, CVs, contact details, publication records, repository links, and verified results still need to be supplied.

A practical browser review: check desktop and mobile widths, 200% text zoom, keyboard navigation, thumbnail selection, topic filtering, lightbox Escape/focus return, reduced-motion mode, video pause on slide change, and refresh on a project URL. Once assets are added, check their actual size, legibility, and playback.
