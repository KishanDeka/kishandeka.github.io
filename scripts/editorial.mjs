import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// --- Helper Functions & Asset Management ---

/**
 * Computes a short hash for static assets to ensure proper browser cache invalidation.
 */
const getRevisionHash = (filePath) => {
  return createHash('sha256')
    .update(fs.readFileSync(`dist/${filePath}`))
    .digest('hex')
    .slice(0, 12);
};

/**
 * Loads and parses JSON content from the /content directory.
 */
const loadContent = (filename) => {
  return JSON.parse(fs.readFileSync(`content/${filename}.json`, 'utf8'));
};

// Load content data
const profile = loadContent('profile');
const projects = loadContent('projects');
const publications = loadContent('publications');
const about = loadContent('about');
const gallery = loadContent('gallery');

/**
 * Escapes unsafe HTML characters to prevent XSS.
 */
const escapeHtml = (str) => {
  return String(str ?? '').replace(/[&<>"']/g, (char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
};

// URL construction helpers
const basePath = ('/' + (process.env.BASE_PATH ?? profile.basePath ?? '').replace(/^\/+|\/+$/g, '')).replace(/\/$/, '');
const buildUrl = (pathSegment) => `${basePath}/${pathSegment}`;
const resolveAssetPath = (pathSegment) => /^https?:/.test(pathSegment) ? pathSegment : buildUrl(pathSegment);
const EXTERNAL_LINK_ATTRS = 'target="_blank" rel="noopener noreferrer"';

// --- SVG Icons & Social Links ---

const SVG_PATHS = {
  github: 'M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.763-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.654 1.653.242 2.873.119 3.176.77.84 1.233 1.91 1.233 3.22 0 4.609-2.807 5.622-5.479 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.596 24 12.297c0-6.627-5.373-12-12-12',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z',
  orcid: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947-.947-.431-.947-.947.422-.947.947-.947zm-.722 3.281h1.444v10.041H6.647V7.659zm3.563 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016H10.21V7.659zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z'
};

const renderIcon = (name) => {
  if (name === 'email') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 9 6a2 2 0 0 0 2 0l9-6"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${SVG_PATHS[name]}"/></svg>`;
};

const SOCIAL_PROFILES = [
  ['github', 'GitHub'],
  ['linkedin', 'LinkedIn'],
  ['email', 'Email'],
  ['orcid', 'ORCID']
];

const getSocialHref = (key) => key === 'email' ? `mailto:${profile[key]}` : profile[key];

const renderSocials = () => {
  const links = SOCIAL_PROFILES
    .filter(([key]) => profile[key])
    .map(([key, name]) => {
      const isEmail = key === 'email';
      const targetAttr = isEmail ? '' : EXTERNAL_LINK_ATTRS;
      return `<a href="${escapeHtml(getSocialHref(key))}" ${targetAttr} aria-label="${name}" title="${name}">${renderIcon(key)}<span class="sr-only">${name}</span></a>`;
    })
    .join('');

  return `<div class="socials" aria-label="Professional profiles">${links}</div>`;
};

const renderGitHubButton = (project) => {
  const repoUrl = project.github || project.links?.find((link) => /^https:\/\/github\.com\/[^/]+\/[^/?#]+/.test(link.url))?.url;
  const href = repoUrl || profile.github;
  const ariaLabel = repoUrl ? `GitHub repository for ${project.title}` : 'Kishan Deka on GitHub';

  return `
    <div class="repo-link">
      <a class="github-button" href="${escapeHtml(href)}" ${EXTERNAL_LINK_ATTRS} aria-label="${ariaLabel}">
        ${renderIcon('github')}<span>GitHub</span>
      </a>
    </div>`;
};

// --- Workflows & Visual Components ---

const WORKFLOW_CONFIGS = {
  foregrounds: { label: 'Signal separation', input: ['CMB sky', 'Galactic emission', 'Instrument noise'], core: 'Component separation', output: ['Lensing reconstruction', 'B-mode delensing'] },
  'tomographic-delensing': { label: 'Complementary tracers', input: ['Galaxy redshift bins', 'CMB observations'], core: 'Tomographic cross-correlation', output: ['Weighted lensing tracer', 'Delensing template'] },
  'psf-modeling': { label: 'Precision photometry', input: ['Stellar images', 'Instrument response'], core: 'PSF model fitting', output: ['Flux measurements', 'Residual validation'] },
  dynamo: { label: 'Numerical experiments', input: ['Initial magnetic field', 'Flow configuration'], core: '2D dynamo · C++ solver', output: ['Python bindings', 'Simulation visualization'] },
  retention: { label: 'Decision analytics', input: ['Customer records', 'Experiment outcomes'], core: 'SQL · PCA · Churn model', output: ['SHAP explanations', 'Retention decisions'] },
  paywatch: { label: 'Streaming inference', input: ['Transaction stream', 'Rolling features'], core: 'LSTM autoencoder → XGBoost', output: ['Fraud scores', 'PostgreSQL audit log'] },
  disasterlens: { label: 'Reproducible computer vision', input: ['AIDERv2 images', 'Augmentation'], core: 'ResNet50 · PyTorch', output: ['Model evaluation', 'CI/CD · Streamlit'] }
};

const renderDiagram = (project) => {
  const workflow = WORKFLOW_CONFIGS[project.id];
  if (!workflow) {
    return `<div class="workflow"><span class="eyebrow">${escapeHtml(project.tags)}</span><h3>${escapeHtml(project.title)}</h3></div>`;
  }

  const inputs = workflow.input.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  const outputs = workflow.output.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
  const ariaLabel = `Workflow schematic: ${workflow.input.join(' and ')} feed ${workflow.core}, leading to ${workflow.output.join(' and ')}. Not measured results.`;

  return `
    <div class="workflow" role="img" aria-label="${escapeHtml(ariaLabel)}">
      <div class="workflow-label">${escapeHtml(workflow.label)}</div>
      <div class="workflow-inputs">${inputs}</div>
      <div class="workflow-connector" aria-hidden="true"></div>
      <div class="workflow-core">${escapeHtml(workflow.core)}</div>
      <div class="workflow-connector" aria-hidden="true"></div>
      <div class="workflow-outputs">${outputs}</div>
      <small>WORKFLOW SCHEMATIC</small>
    </div>`;
};

const renderVisual = (project) => {
  const mediaItem = gallery.find((item) => item.project === project.id && item.src && item.type !== 'placeholder');
  if (!mediaItem) return renderDiagram(project);

  const assetUrl = resolveAssetPath(mediaItem.src);
  const altText = escapeHtml(mediaItem.alt);

  if (['video', 'mp4', 'webm'].includes(mediaItem.type)) {
    const posterAttr = mediaItem.poster ? `poster="${escapeHtml(resolveAssetPath(mediaItem.poster))}"` : '';
    return `<video controls playsinline preload="metadata" ${posterAttr} aria-label="${altText}"><source src="${escapeHtml(assetUrl)}"></video>`;
  }

  if (mediaItem.type === 'gif') {
    return `
      <div class="animated-figure">
        <img class="project-image" data-animated-src="${escapeHtml(assetUrl)}" alt="${altText}" loading="lazy">
        <p class="motion-note" hidden>Animation paused for reduced motion. Open the media gallery to play it.</p>
      </div>`;
  }

  const imageSrc = mediaItem.type === 'gif' && mediaItem.poster ? resolveAssetPath(mediaItem.poster) : assetUrl;
  return `<img class="project-image" src="${escapeHtml(imageSrc)}" alt="${altText}" loading="lazy">`;
};

// Filter project groups
const researchProjects = projects.filter((item) => item.category === 'research');
const industryProjects = projects.filter((item) => item.category === 'industry');
const getDetailUrl = (project) => buildUrl(`projects/${project.id}/`);

// --- UI Structural Components ---

const renderCarousel = (id, title, items, allRoute) => {
  const sectionNumber = id === 'selected-research' ? '01' : '02';
  const totalCount = String(items.length).padStart(2, '0');

  const slides = items.map((item, index) => {
    const isInert = index !== 0;
    return `
      <article class="slide" aria-roledescription="slide" aria-label="${index + 1} of ${items.length}" ${isInert ? 'inert aria-hidden="true"' : 'aria-hidden="false"'}>
        <div class="slide-visual">${renderVisual(item)}</div>
        <div class="slide-copy">
          <span class="eyebrow">${escapeHtml(item.tags)}</span>
          <h3><a href="${getDetailUrl(item)}">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.summary)}</p>
          <a class="text-link" href="${getDetailUrl(item)}">Read the project <span aria-hidden="true">↗</span></a>
          ${renderGitHubButton(item)}
        </div>
      </article>`;
  }).join('');

  const dots = items.map((item, index) => {
    return `<button type="button" data-slide="${index}" aria-label="Show ${escapeHtml(item.title)}" aria-pressed="${index === 0}"><span></span></button>`;
  }).join('');

  return `
    <section class="showcase" data-carousel aria-roledescription="carousel" aria-labelledby="${id}-title">
      <div class="section-heading">
        <h2 id="${id}-title"><span class="section-number">${sectionNumber}</span>${title}</h2>
        <a class="text-link" href="${buildUrl(allRoute)}">View all <span aria-hidden="true">↗</span></a>
      </div>
      <div class="slide-window">
        <div class="slide-track">${slides}</div>
      </div>
      <div class="carousel-bar">
        <div class="slide-dots" role="group" aria-label="Choose ${title.toLowerCase()}">${dots}</div>
        <div class="slide-controls">
          <span data-count>01 / ${totalCount}</span>
          <button type="button" data-prev aria-label="Previous ${title.toLowerCase()} slide">←</button>
          <button type="button" data-next aria-label="Next ${title.toLowerCase()} slide">→</button>
          <button type="button" data-play>Pause</button>
        </div>
      </div>
      <span class="sr-only" data-announcement aria-live="polite"></span>
    </section>`;
};

const renderProjectCard = (project) => {
  return `
    <article class="project-card">
      <a class="card-visual" href="${getDetailUrl(project)}" aria-label="Explore ${escapeHtml(project.title)}">
        ${renderVisual(project)}
      </a>
      <div class="card-copy">
        <span class="eyebrow">${escapeHtml(project.tags)}</span>
        <h2><a href="${getDetailUrl(project)}">${escapeHtml(project.title)}</a></h2>
        <p>${escapeHtml(project.summary)}</p>
        <div class="card-actions">
          <a class="text-link" href="${getDetailUrl(project)}">Read the project ↗</a>
          ${renderGitHubButton(project)}
        </div>
      </div>
    </article>`;
};

const renderPageHeading = (label, title, description) => {
  const isDuplicateLabel = label.toLowerCase() === title.toLowerCase();
  return `
    <header class="page-heading">
      ${isDuplicateLabel ? '' : `<span class="eyebrow">${label}</span>`}
      <h1>${title}</h1>
      <p>${description}</p>
    </header>`;
};

// --- Page Generation Layout ---

const NAV_ITEMS = [
  ['', 'Profile'],
  ['about/', 'About'],
  ['research/', 'Research'],
  ['projects/', 'Projects'],
  ['publications/', 'Publications & talks'],
  ['contact/', 'Contact']
];

const renderPage = (route, pageTitle, pageDescription, bodyContent) => {
  let activeRoute = route;
  if (route.startsWith('projects/') && route !== 'projects/') {
    const currentProject = projects.find((item) => route === `projects/${item.id}/`);
    activeRoute = currentProject?.category === 'research' ? 'research/' : 'projects/';
  }

  const canonicalUrl = profile.siteUrl ? `${profile.siteUrl.replace(/\/$/, '')}${buildUrl(route)}` : '';
  const fullTitle = `${escapeHtml(pageTitle)} | ${escapeHtml(profile.name)}`;
  const escapedDescription = escapeHtml(pageDescription);

  const navigationLinks = NAV_ITEMS.map(([pathSegment, label]) => {
    const isCurrent = activeRoute === pathSegment ? 'aria-current="page"' : '';
    return `<a href="${buildUrl(pathSegment)}" ${isCurrent}>${label}</a>`;
  }).join('');

  const htmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${fullTitle}</title>
  <meta name="description" content="${escapedDescription}">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:type" content="website">
  ${canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}"><meta property="og:url" content="${escapeHtml(canonicalUrl)}">` : ''}
  <meta name="theme-color" content="#f7f9fc">
  <link rel="icon" href="${buildUrl('assets/favicon.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${buildUrl('assets/style.css')}?v=${getRevisionHash('assets/style.css')}">
  <script defer src="${buildUrl('assets/site.js')}?v=${getRevisionHash('assets/site.js')}"></script>
  ${route === 'gallery/' ? `<script defer src="${buildUrl('assets/gallery.js')}?v=${getRevisionHash('assets/gallery.js')}"></script>` : ''}
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="wordmark" href="${buildUrl('')}">Kishan Deka<span>.</span></a>
    <nav aria-label="Main navigation">${navigationLinks}</nav>
  </header>
  <main id="main">
    ${bodyContent}
  </main>
  <footer>
    <span>Kishan Deka · Warsaw, Poland</span>
    <span>Cosmology · Data science · Scientific computing</span>
    <a href="${buildUrl('gallery/')}">Media gallery</a>
  </footer>
</body>
</html>`;

  const targetPath = `dist/${route}index.html`;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, htmlContent);
};

// --- Build Routines for Pages ---

// 1. Home / Profile Page
const portraitMarkup = profile.portrait 
  ? `<img src="${escapeHtml(resolveAssetPath(profile.portrait))}" alt="${escapeHtml(profile.portraitAlt)}" width="290" height="350" fetchpriority="high">${profile.portraitIsDemo ? '<span class="demo-label">Demo portrait</span>' : ''}`
  : `<div class="portrait-pending" role="img" aria-label="Portrait not yet supplied"><span>KD</span><small>Portrait to be added</small></div>`;

const heroSection = `
  <section class="hero">
    <div class="hero-copy">
      <span class="eyebrow">COSMOLOGY · DATA · COMPUTATION</span>
      <h1>About Me</h1>
      <p class="lead" style="text-align: justify">
            Hi, I’m Kishan, a PhD researcher at the National Centre for Nuclear
            Research in Warsaw. My research focuses on CMB lensing and
            systematic effects in CMB experiments. I specialise in building
            computational tools to recover meaningful signals from complex,
            noisy data.
          </p>  
          <p class="hero-secondary" style="text-align: justify">
            My recent work brings together cosmology, statistical inference,
            and scientific computing, alongside projects in data science and
            machine learning.
         </p>
      <a class="text-link" href="${buildUrl('about/')}">More about me <span aria-hidden="true">↗</span></a>
    </div>
    <aside class="portrait-block">
      <div class="portrait">${portraitMarkup}</div>
      ${renderSocials()}
      <p>NCBJ · Warsaw, Poland</p>
    </aside>
  </section>
  ${renderCarousel('selected-research', 'Selected research', researchProjects, 'research/')}
  ${renderCarousel('selected-projects', 'Selected industry projects', industryProjects, 'projects/')}`;

renderPage('', 'Profile', profile.intro, heroSection);

// 2. Main Category Pages
renderPage(
  'research/',
  'Research',
  'CMB lensing, Galactic foregrounds, delensing, and scientific computing.',
  `${renderPageHeading('RESEARCH', 'Research', 'I develop simulation and analysis methods to recover cosmological information from complex observations.')}
   <div class="project-grid">${researchProjects.map(renderProjectCard).join('')}</div>`
);

renderPage(
  'projects/',
  'Industry projects',
  'Analytics, streaming fraud detection, and computer vision.',
  `${renderPageHeading('INDUSTRY PROJECTS', 'Industry projects', 'Data analytics, machine learning, and engineering projects built around careful evaluation and reproducible workflows.')}
   <div class="project-grid">${industryProjects.map(renderProjectCard).join('')}</div>`
);

// 3. Individual Project Pages
for (const project of projects) {
  const sectionsMarkup = Object.entries(project.sections)
    .filter(([heading]) => !['Results & evidence'].includes(heading))
    .map(([heading, text]) => `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text)}</p></section>`)
    .join('');

  const parentCategory = project.category === 'research' ? 'research/' : 'projects/';
  const parentCategoryLabel = project.category === 'research' ? 'Research' : 'Industry projects';

  const extraPublicationMarkup = project.id === 'foregrounds'
    ? `<section>
        <h2>Publication</h2>
        <p>${escapeHtml(publications.publications[0].title)}</p>
        <a class="text-link" href="${escapeHtml(publications.publications[0].url)}" ${EXTERNAL_LINK_ATTRS}>Read the paper ↗</a>
       </section>`
    : '';

  const pageBody = `
    <a class="back" href="${buildUrl(parentCategory)}">← ${parentCategoryLabel}</a>
    ${renderPageHeading(escapeHtml(project.tags), escapeHtml(project.title), escapeHtml(project.summary))}
    <div class="detail-layout">
      <aside>
        <div class="detail-visual">${renderVisual(project)}</div>
        ${renderGitHubButton(project)}
        ${project.links.filter((link) => !link.url.includes('github.com')).map((link) => `<p><a class="text-link" href="${escapeHtml(link.url)}" ${EXTERNAL_LINK_ATTRS}>${escapeHtml(link.label)} ↗</a></p>`).join('')}
        <a class="text-link" href="${buildUrl('gallery/')}">Research media gallery ↗</a>
      </aside>
      <article>
        ${sectionsMarkup}
        ${extraPublicationMarkup}
      </article>
    </div>`;

  renderPage(`projects/${project.id}/`, project.title, project.summary, pageBody);
}

// 4. Publications & Talks Page
const renderRecordList = (records) => {
  return records.map((item) => `
    <article class="record">
      <div class="record-year">${escapeHtml(item.year || 'Seminar')}</div>
      <div>
        <span class="eyebrow">${escapeHtml(item.status)}</span>
        <h3>${item.url ? `<a href="${escapeHtml(item.url)}" ${EXTERNAL_LINK_ATTRS}>${escapeHtml(item.title)}</a>` : escapeHtml(item.title)}</h3>
        ${item.authors ? `<p>${escapeHtml(item.authors)}</p>` : ''}
        <p>${escapeHtml(item.venue)}</p>
        ${item.url ? `<a class="text-link" href="${escapeHtml(item.url)}" ${EXTERNAL_LINK_ATTRS}>Read publication ↗</a>` : ''}
      </div>
    </article>`).join('');
};

renderPage(
  'publications/',
  'Publications & Talks',
  'Selected papers, conference presentations, and invited seminars.',
  `${renderPageHeading('PUBLICATIONS & TALKS', 'Publications & talks', 'Papers, invited seminars, and conference presentations in cosmology and theoretical physics.')}
   <div class="page-jumps">
     <a href="#papers">Publications</a>
     <a href="#talks">Talks & seminars</a>
   </div>
   <section class="content-section" id="papers">
     <h2>Selected publications</h2>
     ${renderRecordList(publications.publications)}
     <p class="source-note">Publication status follows the supplied academic CV.</p>
   </section>
   <section class="content-section" id="talks">
     <h2>Talks & seminars</h2>
     ${renderRecordList(publications.talks)}
   </section>`
);

// 5. About Page
const renderTimeline = (items) => {
  return items.map((item) => `
    <article class="timeline-row">
      <span>${escapeHtml(item.dates)}</span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="institution">${escapeHtml(item.institution)}</p>
        <p>${escapeHtml(item.description)}</p>
      </div>
    </article>`).join('');
};

const renderPlainList = (items) => `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

const skillCategoryFilterButtons = ['All', 'Languages', 'Libraries', 'Tools']
  .map((category, index) => `<button type="button" data-skill-filter="${category}" aria-pressed="${index === 0}">${category}</button>`)
  .join('');

const skillItemsMarkup = about.skills.map((skill) => `
  <div class="skill-item" data-skill-category="${escapeHtml(skill.category)}">
    <span class="skill-logo" aria-hidden="true">
      <span>${escapeHtml(skill.mark)}</span>
      ${skill.icon ? `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/${escapeHtml(skill.icon)}" alt="" loading="lazy" width="48" height="48" data-brand-logo>` : ''}
    </span>
    <span>${escapeHtml(skill.name)}</span>
  </div>`).join('');

const skillGridMarkup = `
  <div class="skill-filters" role="group" aria-label="Filter technical expertise">${skillCategoryFilterButtons}</div>
  <div class="skill-grid">${skillItemsMarkup}</div>
  <span class="sr-only" data-skill-status aria-live="polite"></span>`;

const renderDownloadButton = (filePath, label) => filePath ? `<a class="button" href="${escapeHtml(resolveAssetPath(filePath))}" download>${label}<span aria-hidden="true">↓</span></a>` : '';

renderPage(
  'about/',
  'About',
  'Education, experience, technical expertise, academic CV, and industry resume.',
  `${renderPageHeading('ABOUT', 'About', 'I’m a cosmology researcher with over six years of Python experience, working at the intersection of physics, statistical inference, and large-scale data analysis.')}
   <section class="content-section">
     <!-- <h1>About</h1> -->
     <!-- <div> -->
       <p> My PhD focuses on weak gravitational lensing of the cosmic microwave background, Galactic foregrounds, B-mode delensing, and cross-correlations with large-scale structure. I build end-to-end simulations and analysis pipelines to understand both the signal and the uncertainty behind a result. </p>
       <p> I am also developing projects in data analytics, machine learning, and data engineering. I bring a strong analytical background, careful debugging, and experience communicating technical findings to international audiences. </p>
     </div>
   </section>
   <section class="content-section">
     <h2>Education</h2>
     ${renderTimeline(about.education)}
   </section>
   <section class="content-section">
     <h2>Research experience</h2>
     ${renderTimeline(about.experience)}
   </section>
   <section class="content-section" id="skills">
     <div class="section-heading">
       <h2>Technical expertise</h2>
       <span class="source-note">Languages, packages & tools from my academic CV</span>
     </div>
     ${skillGridMarkup}
   </section>
   <section class="content-section two-column">
     <div>
       <h2>Research visits</h2>
       ${renderPlainList(about.visits)}
       <p>Collaboration experience with LSST DESC and CMB-S4.</p>
     </div>
     <div>
       <h2>Fellowships & awards</h2>
       ${renderPlainList(about.awards)}
     </div>
   </section>
   <section class="content-section">
     <h2>Teaching & communication</h2>
     <p>Teaching assistant for undergraduate Classical Electrodynamics with Prof. Andrzej Hryczuk at NCBJ, Fall 2025. Experience presenting scientific findings in invited seminars and international conferences.</p>
     <a class="text-link" href="${buildUrl('publications/')}#talks">Selected talks ↗</a>
   </section>
   <section class="content-section cv-section" id="cv">
     <div>
       <span class="eyebrow">DOWNLOAD</span>
       <h2>CV & resume</h2>
       <p>Academic background and industry-focused experience.</p>
     </div>
     <div class="documents">
       ${renderDownloadButton(profile.academicCV, 'Academic CV')}
       ${renderDownloadButton(profile.industryResume, 'Industry resume')}
     </div>
   </section>`
);

// 6. Contact Page
const contactLinks = SOCIAL_PROFILES
  .filter(([key]) => profile[key])
  .map(([key, name]) => {
    const isEmail = key === 'email';
    const href = getSocialHref(key);
    const targetAttr = isEmail ? '' : EXTERNAL_LINK_ATTRS;
    
    let displayValue = profile[key];
    if (key === 'github') displayValue = 'KishanDeka';
    if (key === 'linkedin') displayValue = 'Kishan Deka';
    if (key === 'orcid') displayValue = '0000-0002-8229-4326';

    return `
      <a href="${escapeHtml(href)}" ${targetAttr}>
        <span class="contact-name">${renderIcon(key)}<span>${name}</span></span>
        <span class="contact-value">${escapeHtml(displayValue)} <span aria-hidden="true">↗</span></span>
      </a>`;
  })
  .join('');

renderPage(
  'contact/',
  'Contact',
  'Contact Kishan Deka and explore his professional profiles.',
  `${renderPageHeading('CONTACT', 'Contact', 'For conversations about cosmology, scientific computing, and opportunities in data science or machine learning.')}
   <div class="contact-list">${contactLinks}</div>
   <p class="contact-location">National Centre for Nuclear Research · Warsaw, Poland</p>`
);

// 7. Gallery Page
const uniqueCategories = [...new Set(gallery.map((item) => item.category))];
const categoryOptions = uniqueCategories.map((category) => `<option>${escapeHtml(category)}</option>`).join('');

const galleryMarkup = `
  <section class="gallery" aria-label="Scientific media gallery" data-gallery="${buildUrl('assets/gallery.json')}" data-base="${basePath}">
    <div class="gallery-stage" id="gallery-stage"></div>
    <div class="gallery-bottom">
      <div>
        <span class="eyebrow" id="gallery-label"></span>
        <h3 id="gallery-title"></h3>
        <p id="gallery-caption"></p>
        <a class="text-link" id="gallery-project">Explore project ↗</a>
      </div>
      <div class="gallery-controls">
        <button type="button" data-prev aria-label="Previous slide">←</button>
        <span id="gallery-count" aria-live="polite"></span>
        <button type="button" data-next aria-label="Next slide">→</button>
      </div>
    </div>
    <div class="thumbnails" aria-label="Choose a slide"></div>
    <noscript><p>Enable JavaScript to use the media gallery. All project pages remain available from the navigation.</p></noscript>
  </section>`;

renderPage(
  'gallery/',
  'Research media gallery',
  'Scientific figures and simulation media.',
  `${renderPageHeading('MEDIA GALLERY', 'Media gallery', 'Figures and simulation media from PSF photometry, CMB foregrounds, MHD, and SO × LSST delensing.')}
   <label class="filter-label">Filter by topic 
     <select id="gallery-filter">
       <option value="all">All topics</option>
       ${categoryOptions}
     </select>
   </label>
   ${galleryMarkup}`
);

// --- Output Assets & 404 ---

fs.mkdirSync('dist/assets', { recursive: true });
fs.writeFileSync('dist/assets/gallery.json', JSON.stringify(gallery, null, 2));

const pageNotFoundHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Page not found | Kishan Deka</title>
  <link rel="stylesheet" href="${buildUrl('assets/style.css')}?v=${getRevisionHash('assets/style.css')}">
</head>
<body>
  <main class="page-heading">
    <h1>Page not found.</h1>
    <a class="text-link" href="${buildUrl('')}">Return to profile</a>
  </main>
</body>
</html>`;

fs.writeFileSync('dist/404.html', pageNotFoundHtml);

console.log(`Generated ${7 + projects.length} editorial pages; base path: ${basePath || '/'}`);
