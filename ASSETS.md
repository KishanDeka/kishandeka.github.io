# Assets and provenance

## Demo portrait

- File: `dist/assets/media/demo-portrait.png`
- Created using the built-in image-generation tool for this portfolio.
- A fictional, anonymous illustrated person; **not a likeness of Kishan Deka**. The page labels it as a demo and its alternative text states this explicitly.
- Replace it using `portrait`, `portraitAlt`, and `portraitIsDemo` in `content/profile.json`.

Exact generation prompt:

> Use case: stylized-concept
> Asset type: temporary website profile portrait
> Primary request: Create exactly one tasteful anonymous illustrated head-and-shoulders avatar of a fictional adult male researcher. He has short dark hair and wears a simple navy shirt.
> Scene/backdrop: plain light gray background.
> Style/medium: polished editorial illustration, visibly drawn with simplified shapes and subtle texture, not a photograph.
> Composition/framing: centered portrait, head and shoulders comfortably inside the frame; vertical 27:32 composition suited to a 270 by 320 pixel profile box.
> Lighting/mood: calm, approachable, professional.
> Color palette: muted navy and teal with natural subdued skin tones and light gray.
> Constraints: This is an anonymous fictional demo avatar, not a depiction or asserted likeness of the real Kishan Deka. No text, no watermark, no logos, no objects, no extra people.

## Technical expertise icons

Where available, brand assets load from the pinned Devicon v2.17.0 collection through jsDelivr. [Devicon project and licensing](https://github.com/devicons/devicon) (MIT); individual logos remain trademarks of their respective owners. No endorsement is implied.

The site does not require these images to function. If unavailable, it shows local typographic marks and full skill labels. Scientific-package text marks are labels, not claimed official logos. Live CDN responses were not verified in this build environment.

## Social icons

GitHub, LinkedIn, and ORCID SVG brand silhouettes identify links to those services. Brands and marks belong to their respective owners. The envelope icon represents email. No social tracking SDKs are loaded.

## Scientific and industry visuals

The profile and project cards use locally rendered workflow schematics derived from the project descriptions. They are labeled as schematics and are not observed data, simulation output, or model evaluation figures. Actual original media can be configured in `content/gallery.json`.

## Documents

`dist/documents/cv_kishan.pdf` and `dist/documents/Kishan_Deka_Industry_Resume.pdf` are the supplied files, included unchanged. They contain personal and professional information; review them before public deployment.
