# Kishan Deka — Research & Engineering

A minimal, light-theme editorial portfolio for computational cosmology and industry-facing data projects. Built with semantic HTML, CSS, vanilla JavaScript, and a small dependency-free Node.js generator. Ready for GitHub Pages at https://kishandeka.github.io/.

## What is included

- **Profile:** short biography, a clearly labeled demo portrait, GitHub/LinkedIn/email/ORCID icons, and separate sliding showcases for selected research and industry projects.
- **About:** education, research experience, filterable technical expertise, research visits, fellowships, teaching, and downloads of the supplied academic CV and industry resume.
- **Research and Projects:** separate listings and seven individual project pages, each with a GitHub button.
- **Publications & talks:** three publication records and ten talks/seminars from the academic CV.
- **Contact:** working professional profile and email links with icons.
- **Media gallery:** the original topic filter and accessible image/video lightbox, ready for actual scientific media.

All GitHub buttons currently open https://github.com/KishanDeka/, as requested. Project-specific repositories can be added later. Research and industry slider visuals are **workflow schematics**, not fabricated scientific figures or measured results. The supplied original documents are included unchanged.

## Run locally

Requirements: Node.js 22+; Python 3 for the optional local server. No npm packages or installation are required.

```bash
npm run build
npm run check
npm run preview
```

Open `http://localhost:8080`. Stop the server with Ctrl+C. Serve the website instead of opening HTML files directly: the media gallery loads local JSON.

Rebuild after changing JSON content or page templates. CSS and client JavaScript are authored directly in `dist/assets` and take effect on refresh. **Do not delete `dist`: it contains authored assets and the PDF downloads, not just generated pages.**

## Repository structure

```text
.
├── .github/workflows/pages.yml  # GitHub Pages build/check/deploy
├── content/
│   ├── profile.json            # Identity, contacts, portrait, document paths
│   ├── about.json              # Education, experience, skills, visits, awards
│   ├── projects.json           # Seven research/industry projects
│   ├── publications.json       # Papers and talks from the CV
│   └── gallery.json            # Original research media configuration
├── scripts/
│   ├── build.mjs               # Build entrypoint
│   ├── editorial.mjs           # Page templates and workflow schematics
│   └── check.mjs               # Link, content, asset, and syntax checks
├── dist/
│   ├── index.html              # Profile
│   ├── about/index.html
│   ├── research/index.html
│   ├── projects/               # Industry listing and individual project pages
│   ├── publications/index.html
│   ├── contact/index.html
│   ├── gallery/index.html
│   ├── 404.html
│   ├── assets/
│   │   ├── style.css
│   │   ├── site.js             # Two independent sliders and skill filters
│   │   ├── gallery.js          # Gallery filter, lightbox, video controls
│   │   ├── media/demo-portrait.png
│   │   └── favicon.svg
│   └── documents/
│       ├── Academic_CV.pdf
│       └── Industry_Resume.pdf
├── ASSETS.md
└── package.json
```

## Host on GitHub Pages

1. Create a repository called **`USERNAME.github.io`** in your GitHub account.
2. Extract this ZIP and upload everything **inside** its `kishan-deka-portfolio` folder to the repository root, including `.github`. Do not upload the ZIP itself or add an extra enclosing folder.
3. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
4. Push to the `main` branch. The included workflow builds, validates, and deploys `dist`.
5. After the workflow succeeds, visit **https://USERNAME.github.io/**.

For an existing local clone:

```bash
git add .
git commit -m "Add editorial portfolio"
git push origin main
```

The archive does not contain Git history, credentials, or internal hosting configuration. It contains the complete source and built site. No GitHub repository was created or deployed on your behalf.

The workflow also supports project repositories: it obtains the appropriate subpath from GitHub Pages. For local testing at a subpath:

```bash
BASE_PATH=/portfolio-test npm run build
BASE_PATH=/portfolio-test npm run check
# Restore the root-site output before normal local preview:
npm run build
```

`siteUrl` in `content/profile.json` is the origin used for canonical metadata; `basePath` is empty for a user site. Each page has a real `index.html`, so direct links and refreshes work without SPA rewrite rules.

## Replace the demo portrait

The bundled illustration is an AI-generated **demo**, not a representation of Kishan. To use your own photo:

1. Copy it to `dist/assets/media/portrait.jpg`.
2. Change these fields in `content/profile.json`:

```json
"portrait": "assets/media/portrait.jpg",
"portraitAlt": "Kishan Deka",
"portraitIsDemo": false
```

3. Run `npm run build`. A vertical photo with centered head-and-shoulders framing works best.

## Edit content and links

Contact links, email, and document paths are in `content/profile.json`. The PDF paths are relative to `dist`. Replace the PDFs at those same paths to retain their download URLs.

Education and skills are in `content/about.json`. Categories must be `Languages`, `Libraries`, or `Tools`. Each skill uses a branded icon when available and a local text mark otherwise. Devicon images load from a pinned external CDN; labels and text marks remain usable if offline or an image is unavailable. See `ASSETS.md`.

Publication records and talk titles follow the supplied academic CV. They are not live-updated from external bibliographic services. The CV and industry resume give different GPA values; the website intentionally omits GPA. PhD status remains ongoing, consistent with the supplied CV; change it when the degree is awarded.

For a project-specific GitHub button, add a `github` field to that project in `content/projects.json`:

```json
"github": "https://github.com/KishanDeka/your-repository"
```

Alternatively, add a repository URL to its `links` array. The explicit `github` field takes precedence. Otherwise the button opens the configured GitHub profile without pretending it is a specific repository.

The project lists and homepage showcases derive from `category: "research"` or `"industry"`. Project IDs remain stable to preserve existing URLs. Change project text, statuses, and sections in the same file. Publication numerical claims should be accompanied by actual results rather than portfolio placeholders.

## Replace workflow diagrams with research graphics

Copy a figure to `dist/assets/media/`, then set the corresponding entry in `content/gallery.json`:

```json
{
  "id": "foreground-comparison",
  "title": "Foreground residual comparison",
  "project": "foregrounds",
  "label": "CMB FOREGROUNDS",
  "category": "CMB",
  "type": "image",
  "src": "assets/media/foreground-comparison.webp",
  "thumbnail": null,
  "poster": null,
  "alt": "Describe the panels, axes, and quantities shown.",
  "caption": "Describe the actual simulation conditions and result."
}
```

After rebuilding, the first configured non-placeholder media item for a project replaces its workflow schematic on the profile, listing, and detail page. The same mechanism supports industry projects: add an entry whose `project` matches their ID.

Types: `image`, `gif`, or `video` (`mp4` and `webm` also accepted). Prefer video over large GIFs, and supply a static `poster` for moving media. Inline showcase GIFs use their poster when supplied; the gallery provides the enlarged media. Videos have native controls and pause when leaving the current slide or viewport, or when the tab is hidden. Images use `object-fit: contain` to protect scientific axes and legends. Original gallery entries remain clearly labeled media placeholders until supplied.

## Motion and accessibility

- The two homepage carousels advance automatically every 5.5 seconds. Hovering or keyboard focus pauses a slider; leaving resumes it unless manually paused. Reduced-motion users start paused.
- Previous/next buttons, slide selectors, left/right keyboard navigation, horizontal touch swipe, and explicit Play/Pause controls are included.
- Autoplay starts disabled for reduced-motion users; CSS also removes sliding transitions.
- Inactive slides are inert and hidden from assistive technology. Manual slide changes are announced; automatic changes are not.
- Skill filters are native buttons with pressed states and an announced result count.
- Main navigation, skip link, visible focus styles, image descriptions, semantic headings, and responsive layouts are included.
- The separate media gallery is manual, with topic filtering, thumbnails, native-dialog lightbox, Escape-to-close, and focus restoration.

## Checks and limitations

`npm run check` validates generated routes, local links and fragments, unique IDs, assets, project and gallery metadata, PDFs, JavaScript syntax, and the two homepage carousel structures. Checks are run at `/` and `/portfolio-test` before packaging.

These are static/build checks, not a browser or screen-reader audit. Browser layout, actual swipe gestures, live external links/CDN availability, and GitHub Actions deployment are not claimed as tested. Before publishing, review desktop/mobile layouts and replace the demo portrait and workflow schematics with your own media when ready.

## Light plum editorial edition

The entire site uses cool white backgrounds, blue-gray surfaces, charcoal typography, and a deep plum accent, with a serif editorial hierarchy and numbered research/project showcases. Theme overrides are grouped at the end of `dist/assets/style.css`.

Education, technical skills, and teaching details were updated from the CV attached on 11 September 2026. The academic CV download is that exact supplied PDF. Existing industry resume and professional links are retained. Skill tiles use local typographic marks and do not require external images. The existing portrait remains explicitly labeled as a demo, not a likeness.

Both profile sliders start automatically, except when reduced motion is requested. They pause on hover and resume after the pointer leaves. Controls include previous/next, slide selectors, arrow keys, touch swipe, and optional Play/Pause. Skills can be filtered by Languages, Libraries, or Tools.

## Autoplay and cache update

CSS and JavaScript URLs include content hashes so changed assets receive new browser cache keys. Mouse focus no longer prevents autoplay resuming after hover; visible keyboard focus still pauses the carousel. Run `node scripts/check-carousel.mjs` for deterministic timer and interaction checks using a DOM harness (not a browser audit).

Upload the entire project and wait for the GitHub Pages workflow to finish. Hard-refresh once if your browser still displays a previously cached HTML page.

## Research graphics

The four supplied figures are now mapped in content/gallery.json: ccd_psf_new.png → PSF photometry; hilc_exp.png → CMB foregrounds; dynamo-demo.gif → MHD/dynamo; pipeline_optimal.png → SO × LSST. Original bytes are preserved. They appear in the profile research slider, research cards, project pages, and expandable gallery. Figures are contained on white backgrounds to preserve labels and diagram transparency. The GIF animates for ordinary motion settings; reduced-motion visitors can explicitly open it from the gallery.
