import {
  readFileSync,
  mkdirSync,
  writeFileSync,
  cpSync,
  rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import path from "node:path";
import { partitionNews } from "../src/news-window.mjs";
export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const read = (name) =>
  JSON.parse(readFileSync(path.join(root, "content", `${name}.json`), "utf8"));
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let site = read("site");
let assetFiles = { styles: "styles.css", script: "site.js" };
let pageStyles = "";
let pageScript = "";
const img = (i, cls = "", eager = false) =>
  `<img src="${esc(i.src)}" alt="${esc(i.alt)}" class="${cls}"${i.width && i.height ? ` width="${Number(i.width)}" height="${Number(i.height)}"` : ""} loading="${eager ? "eager" : "lazy"}" decoding="async"${i.widthPercent ? ` style="width:${Number(i.widthPercent)}%"` : ""}>`;
const homeHero = () =>
  `<div class="hero-shell"><div class="hero" role="img" aria-label="Soft robotic gripper, printed circuits, paper flower, illuminated tree circuits and printed electronics"><img class="hero-base" src="${site.hero.src}" alt="" fetchpriority="high"><svg class="hero-panel robot" viewBox="0 650 660 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="${site.hero.src}" width="3341" height="2222"/></svg><svg class="hero-panel tree" viewBox="790 430 920 880" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="${site.tree.src}" width="2500" height="1667"/></svg></div></div>`;
const header = (current) =>
  `<header class="site-header${current === "/" ? " home-header" : ""}"><div class="header-inner"><a href="/" class="brand">${img(site.logo, "logo", true)}<span>${esc(site.name)}</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation"><span></span><span></span><span></span></button><nav id="site-nav" aria-label="Main navigation">${site.navigation.map((n) => `<a href="${n.path}"${n.path === current ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`).join("")}</nav></div></header>${current === "/" ? homeHero() : ""}`;
const document = (title, route, body) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Internet of Matter Lab at the University of Notre Dame. Sustainable electronics, soft robotics, fabrication and human-computer interaction."><title>${esc(title)} | ${esc(site.name)}</title><link rel="icon" href="${site.favicon.png}" type="image/png" sizes="64x64"><link rel="icon" href="${site.favicon.svg}" type="image/svg+xml" sizes="any"><style>${pageStyles}</style></head><body><a href="#main" class="skip-link">Skip to content</a>${header(route)}<main id="main">${body}</main><script>${pageScript}</script></body></html>`;
function home() {
  const h = read("home");
  return `<div class="container home"><div class="opening rich">${h.openingHtml}</div><section class="news"><h1 class="news-title">Recent News:</h1><ul data-news-list="recent" data-news-src="/${assetFiles.news}">${partitionNews(h.news).recent.map((n) => n.html).join("")}</ul></section><a class="outline-link" href="/older-news/">Older News</a><section class="vision">${img(h.visionImage)}<div class="vision-text rich">${h.visionHtml}</div></section><section class="research"><h2>${esc(h.researchTitle)}</h2><div class="rich">${h.researchHtml}</div></section><section class="gallery" aria-label="Research photos"><div class="slides">${h.gallery.map((i, n) => `<figure${n ? " hidden" : ""}>${img(i, "", n === 0)}</figure>`).join("")}</div><div class="gallery-controls"><button data-gallery="previous" aria-label="Previous research photo">‹</button><span class="gallery-count" aria-live="polite">1 / ${h.gallery.length}</span><button data-gallery="next" aria-label="Next research photo">›</button></div></section>${img(h.affiliations, "affiliations")}</div>`;
}
function olderNews() {
  const entries = partitionNews(read("home").news).older;
  return `<div class="container news-archive"><h1>Older News</h1><p><a href="/">← Back to Home</a></p><ul class="news-archive-list rich" data-news-list="older" data-news-src="/${assetFiles.news}">${entries.map(entry => entry.html).join("")}</ul></div>`;
}
// Justify rows using natural aspect ratios, avoiding a single-photo final row.
// Equal row heights and aligned outer edges without cropping or stretching.
function groupPhotoRows(group) {
  const rows = [];
  const columns = images => images.map(image => `minmax(0, ${Number(image.width) / Number(image.height)}fr)`).join(" ");
  for (let offset = 0; offset < group.images.length;) {
    const count = group.images.length - offset === 4 ? 2 : 3;
    const images = group.images.slice(offset, offset + count);
    rows.push(`<div class="group-photo-row" style="--photo-columns:${columns(images)};--photo-mobile-columns:${columns(images.slice(0, 2))}">${images.map(i => img(i)).join("")}</div>`);
    offset += images.length;
  }
  return rows.join("");
}
function team() {
  const t = read("team"),
    p = t.pi;
  return `<div class="container team"><h1>${esc(t.title)}</h1><section class="pi"><div class="pi-profile">${img(p.portrait, "portrait")}<h2>${esc(p.role)}</h2><p>${esc(p.office)}</p><a href="https://tingyucheng.com/" target="_blank" rel="noopener noreferrer">Read More</a></div><div class="pi-bio"><div class="rich">${p.biographyHtml}</div><div class="contacts">${p.contacts.map((c) => `<a href="${esc(c.url)}" aria-label="${esc(c.label)}" target="_blank" rel="noopener noreferrer">${img(c.icon)}</a>`).join('<span class="slash" aria-hidden="true">/</span>')}<span class="slash" aria-hidden="true">/</span><a href="mailto:${p.email}" aria-label="Email Tingyu Cheng"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5Z"/></svg></a><span class="email-text">Email: tcheng2 [at] nd (dot) edu</span></div></div></section><section class="members" aria-label="Lab members">${t.members.map((m) => `<article class="member">${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${img(m.portrait, "portrait")}</a>` : img(m.portrait, "portrait")}<h2>${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${esc(m.name)}</a>` : esc(m.name)}</h2><div class="rich role">${m.roleHtml}</div></article>`).join("")}</section><section class="alumni rich">${t.alumniHtml}</section><section class="group-photos"><h2>Group photos</h2>${t.groupPhotos.map((g) => `<h3>${esc(g.year)}:</h3>${groupPhotoRows(g)}`).join("")}</section></div>`;
}
function publications() {
  const papers = read("publications").sort((a, b) => b.date.localeCompare(a.date));
  const years = [...new Set(papers.map(paper => paper.date.slice(0, 4)))];
  const thumbnail = image => {
    const { widthPercent, ...picture } = image;
    return `<a class="publication-image" href="${esc(image.src)}" aria-label="Enlarge image: ${esc(image.alt)}">${img(picture)}</a>`;
  };
  const icon = label => {
    const type = /pdf/i.test(label) ? "pdf" : /code|source/i.test(label) ? "code" : /video/i.test(label) ? "video" : /doi/i.test(label) ? "link" : "page";
    const shapes = {
      pdf: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
      code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20"/>',
      video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/>',
      link: '<path d="m10 13 4-4m-6 5-2 2a4 4 0 0 0 6 6l3-3m-1-9 2-2a4 4 0 0 0-6-6L7 9" transform="translate(0 -1)"/>',
      page: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z"/>',
    };
    return `<svg class="resource-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${shapes[type]}</svg>`;
  };
  const trophy = '<svg class="trophy-icon" viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="M8 5H4v3c0 4 2 6 6 6M20 5h4v3c0 4-2 6-6 6" fill="none" stroke="#b78422" stroke-width="1.8" stroke-linecap="round"/><path d="M8 3h12v7c0 5-3 8-6 8s-6-3-6-8Z" fill="#e6b54b" stroke="#b78422" stroke-width="1.4"/><path d="M14 18v5M9 25h10" fill="none" stroke="#b78422" stroke-width="2" stroke-linecap="round"/><path d="m14 6 1.2 2.4 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4Z" fill="#fff8df"/></svg>';
  const ribbon = '<svg class="honor-icon" viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="m8 16-2 9 5-2 3 3 2-10m4 0 2 9-5-2-3 3-2-10" fill="#faf0d0" stroke="#b78422" stroke-width="1.3" stroke-linejoin="round"/><circle cx="14" cy="11" r="8" fill="#e6b54b" stroke="#b78422" stroke-width="1.3"/><path d="m14 6 1.4 2.8 3.1.5-2.2 2.2.5 3.1-2.8-1.5-2.8 1.5.5-3.1L9.5 9.3l3.1-.5Z" fill="#fff8df"/></svg>';
  const highlight = item => {
    const mark = item.icon === "trophy" ? trophy : item.icon === "ribbon" ? ribbon : ["seattletimes", "daily"].includes(item.brand) ? `<span class="publication-wordmark ${esc(item.brand)}" aria-hidden="true">${item.brand === "daily" ? "D" : "ST"}</span>` : `<img class="publication-mark" src="/assets/marks/${esc(item.brand)}.png" alt="" width="14" height="12" loading="lazy">`;
    const contents = `${mark}<span>${esc(item.label)}</span>`;
    const cls = `publication-highlight${item.icon ? " paper-award" : ""}`;
    return `<li>${item.url ? `<a class="${cls}" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${contents}</a>` : `<span class="${cls}">${contents}</span>`}</li>`;
  };
  const article = paper => {
    const imageShare = Math.max(20, Math.min(50, Number(paper.imageShare || 38)));
    const imageColumns = paper.images.map(image => `minmax(0, ${Number(image.widthPercent || 1)}fr)`).join(" ");
    const resources = [...(paper.links || []).map(link => `<a class="publication-button" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${icon(link.label)}<span>${esc(link.label)}</span></a>`), ...(paper.resourceLabels || []).map(label => `<span class="publication-button unavailable" aria-disabled="true" title="Link coming soon">${icon(label)}<span>${esc(label)} <span class="coming-soon">(soon)</span></span></span>`)].join("");
    return `<article class="project" data-date="${esc(paper.date)}" data-themes="${esc((paper.themes || []).join(" "))}" style="--publication-image-share:${imageShare}%;--publication-image-columns:${imageColumns}"><div class="project-images">${paper.images.map(thumbnail).join("")}</div><div class="project-copy"><h3>${paper.titleUrl ? `<a href="${esc(paper.titleUrl)}" target="_blank" rel="noopener noreferrer">${esc(paper.title)}</a>` : esc(paper.title)}</h3><p class="publication-authors">${esc(paper.authors)}</p><p class="publication-venue"><strong>${esc(paper.venue)}</strong></p>${paper.highlights?.length ? `<ul class="publication-highlights" aria-label="Awards and media coverage">${paper.highlights.map(highlight).join("")}</ul>` : ""}${resources ? `<div class="publication-resources" aria-label="Paper resources">${resources}</div>` : ""}</div></article>`;
  };
  const groups = years.map(year => `<section class="publication-year" aria-labelledby="publications-${year}"><h2 id="publications-${year}" class="publication-year-title">${year}</h2>${papers.filter(paper => paper.date.startsWith(year)).map(article).join("")}</section>`).join("");
  const filters = [["all", "All"], ["sensing", "Sensing & Interactions"], ["multimodal", "Multimodal"], ["robotics", "Robotics"], ["sustainability", "Sustainability"]];
  return `<div class="container projects"><h1>Full Publication List</h1><div class="publication-filters" role="group" aria-label="Filter publications by research area" hidden>${filters.map(([theme, label]) => `<button type="button" data-publication-filter="${theme}" aria-pressed="${theme === "all"}">${esc(label)}</button>`).join("")}</div><p class="sr-only publication-filter-status" role="status" aria-live="polite" aria-atomic="true"></p>${groups}<a class="outline-link" href="https://tingyucheng.com/work" target="_blank" rel="noopener noreferrer">Prior Publications</a><dialog class="publication-lightbox" aria-label="Publication image viewer"><button type="button" class="lightbox-close" aria-label="Close enlarged image" autofocus>×</button><img class="lightbox-image" alt=""></dialog></div>`;
}
function teaching() {
  const t = read("teaching");
  return `<div class="container teaching"><h1>${esc(t.title)}</h1><div class="rich">${t.bodyHtml}</div><div class="photo-grid teaching-photos">${t.photos.map((i) => img(i)).join("")}</div></div>`;
}
function opportunities() {
  const o = read("opportunities");
  return `<div class="container opportunities"><h1>${esc(o.title)}</h1><div class="opportunities-intro rich">${o.bodyHtml}</div><div class="photo-grid campus-photos">${o.photos.map((i) => img(i)).join("")}</div><div class="university rich">${o.universityHtml}</div></div>`;
}
export function build() {
  site = read("site");
  const out = path.join(root, "dist");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(path.join(root, "public"), out, { recursive: true });
  for (const [key, source] of [["styles", "styles.css"], ["script", "site.js"]]) {
    let content = readFileSync(path.join(root, "src", source));
    if (key === "script") {
      const newsHelpers = readFileSync(path.join(root, "src/news-window.mjs"), "utf8").replace(/^export /gm, "");
      content = Buffer.from(newsHelpers + "\n" + content.toString());
    }
    // Ship presentation and behavior with the HTML so cached pages cannot
    // reference files removed by a newer deployment. Script runs after the DOM.
    const text = content.toString();
    const closingTag = key === "styles" ? /<\/style\b/i : /<\/script\b/i;
    if (closingTag.test(text)) throw new Error(`${source}: unexpected HTML closing tag`);
    if (key === "styles") pageStyles = text;
    else pageScript = text;
    const revision = createHash("sha256").update(content).digest("hex").slice(0, 10);
    assetFiles[key] = source.replace(/\.(css|js)$/, `-${revision}.$1`);
    writeFileSync(path.join(out, assetFiles[key]), content);
    // Historical hashes in public/ and these stable URLs support cached pages
    // published before CSS and JavaScript were embedded in HTML.
    writeFileSync(path.join(out, source), content);
  }
  const newsFeed = JSON.stringify(read("home").news);
  const newsRevision = createHash("sha256").update(newsFeed).digest("hex").slice(0, 10);
  assetFiles.news = `news-${newsRevision}.json`;
  writeFileSync(path.join(out, assetFiles.news), newsFeed);
  const a = read("archive");
  const routes = [
    ["/", "Home", home()],
    ["/older-news/", "Older News", olderNews()],
    ["/team/", "Team", team()],
    ["/s-projects-basic/", "Projects & Publications", publications()],
    ["/projects-7/", "Teaching", teaching()],
    ["/opportunities/", "Opportunities", opportunities()],
    [
      "/publications/",
      "Research Publications",
      `<div class="container archive"><h1>${a.title}</h1><div class="rich">${a.bodyHtml}</div></div>`,
    ],
  ];
  for (const [route, title, body] of routes) {
    const dir = path.join(out, route);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "index.html"), document(title, route, body));
  }
  writeFileSync(
    path.join(out, "404.html"),
    document(
      "Page not found",
      "",
      `<div class="container"><h1>Page not found</h1><p><a href="/">Return to Home</a></p></div>`,
    ),
  );
  console.log(`Built ${routes.length} pages with local assets.`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) build();
