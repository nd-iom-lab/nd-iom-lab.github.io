import {
  readFileSync,
  mkdirSync,
  writeFileSync,
  cpSync,
  rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
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
const img = (i, cls = "", eager = false) =>
  `<img src="${esc(i.src)}" alt="${esc(i.alt)}" class="${cls}" loading="${eager ? "eager" : "lazy"}" decoding="async"${i.widthPercent ? ` style="width:${Number(i.widthPercent)}%"` : ""}>`;
const header = (current) =>
  `<header class="site-header"><div class="header-inner"><a href="/" class="brand">${img(site.logo, "logo", true)}<span>${esc(site.name)}</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation"><span></span><span></span><span></span></button><nav id="site-nav" aria-label="Main navigation">${site.navigation.map((n) => `<a href="${n.path}"${n.path === current ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`).join("")}</nav></div></header><div class="hero-shell"><div class="hero" role="img" aria-label="Soft robotic gripper, printed circuits, paper flower, illuminated tree circuits and printed electronics"><img class="hero-base" src="${site.hero.src}" alt="" fetchpriority="high"><svg class="hero-panel robot" viewBox="0 650 660 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="${site.hero.src}" width="3341" height="2222"/></svg><svg class="hero-panel tree" viewBox="790 430 920 880" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="${site.tree.src}" width="2500" height="1667"/></svg></div></div>`;
const document = (title, route, body) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Internet of Matter Lab at the University of Notre Dame. Sustainable electronics, soft robotics, fabrication and human-computer interaction."><title>${esc(title)} | ${esc(site.name)}</title><link rel="icon" href="${site.logo.src}"><link rel="stylesheet" href="/styles.css"><script src="/site.js" defer></script></head><body><a href="#main" class="skip-link">Skip to content</a>${header(route)}<main id="main">${body}</main></body></html>`;
function home() {
  const h = read("home");
  return `<div class="container home"><div class="opening rich">${h.openingHtml}</div><section class="news"><h1 class="news-title">Recent News:</h1><ul>${h.news.map((n) => n.html).join("")}</ul></section><a class="outline-link" href="#older-news">Older News</a><section class="vision">${img(h.visionImage)}<div class="vision-text rich">${h.visionHtml}</div></section><section class="research"><h2>${esc(h.researchTitle)}</h2><div class="rich">${h.researchHtml}</div></section><section class="gallery" aria-label="Research photos"><div class="slides">${h.gallery.map((i, n) => `<figure${n ? " hidden" : ""}>${img(i, "", n === 0)}</figure>`).join("")}</div><div class="gallery-controls"><button data-gallery="previous" aria-label="Previous research photo">‹</button><span class="gallery-count" aria-live="polite">1 / ${h.gallery.length}</span><button data-gallery="next" aria-label="Next research photo">›</button></div></section><section id="older-news" class="older-news"><h2>Older News</h2><div class="rich">${h.olderNewsHtml}</div></section>${img(h.affiliations, "affiliations")}</div>`;
}
function team() {
  const t = read("team"),
    p = t.pi;
  return `<div class="container team"><h1>${esc(t.title)}</h1><section class="pi"><div class="pi-profile">${img(p.portrait, "portrait")}<h2>${esc(p.role)}</h2><p>${esc(p.office)}</p><a href="https://tingyucheng.com/" target="_blank" rel="noopener noreferrer">Read More</a></div><div class="pi-bio"><div class="rich">${p.biographyHtml}</div><div class="contacts">${p.contacts.map((c) => `<a href="${esc(c.url)}" aria-label="${esc(c.label)}" target="_blank" rel="noopener noreferrer">${img(c.icon)}</a>`).join('<span class="slash" aria-hidden="true">/</span>')}<span class="slash" aria-hidden="true">/</span><a href="mailto:${p.email}" aria-label="Email Tingyu Cheng"><svg viewBox="0 0 24 16" aria-hidden="true"><path d="M0 0h24L12 8zm0 2 12 8 12-8v14H0z"/></svg></a><span class="email-text">Email: tcheng2 [at] nd (dot) edu</span></div></div></section><section class="members" aria-label="Lab members">${t.members.map((m) => `<article class="member">${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${img(m.portrait, "portrait")}</a>` : img(m.portrait, "portrait")}<h2>${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">${esc(m.name)}</a>` : esc(m.name)}</h2><div class="rich role">${m.roleHtml}</div></article>`).join("")}</section><section class="alumni rich">${t.alumniHtml}</section><section class="group-photos"><h2>Group photos</h2>${t.groupPhotos.map((g) => `<h3>${esc(g.year)}:</h3><div class="photo-grid group-${g.year}">${g.images.map((i) => img(i)).join("")}</div>`).join("")}</section></div>`;
}
function publications() {
  return `<div class="container projects"><h1 class="sr-only">Publications and Projects</h1>${read(
    "publications",
  )
    .map(
      (p, n) =>
        `<article class="project"><div class="project-copy"><p class="project-meta">${esc(p.meta)}</p><h2>${p.titleUrl ? `<a href="${esc(p.titleUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a>` : esc(p.title)}</h2><div class="rich">${p.detailsHtml || `<p>${esc(p.authors)}. ${esc(p.venue)}.</p><p>${(p.links || []).map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join(" | ")}</p>`}</div>${p.award ? `<p class="award"><svg class="award-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12v3h4v3c0 4-3 6-6 6-1 1-2 2-3 2v4h5v2H6v-2h5v-4c-1 0-2-1-3-2-3 0-6-2-6-6V5h4zm0 5H4v1c0 2 1 3 3 4zm12 0-1 5c2-1 3-2 3-4V7z"/></svg> ${esc(p.award)}</p>` : ""}</div><div class="project-images">${p.images.map((i) => img(i)).join("")}</div></article>`,
    )
    .join(
      "",
    )}<a class="outline-link" href="https://tingyucheng.com/work" target="_blank" rel="noopener noreferrer">Prior Publications</a></div>`;
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
  cpSync(path.join(root, "src/styles.css"), path.join(out, "styles.css"));
  cpSync(path.join(root, "src/site.js"), path.join(out, "site.js"));
  const a = read("archive");
  const routes = [
    ["/", "Home", home()],
    ["/team/", "Team", team()],
    ["/s-projects-basic/", "Publications and Projects", publications()],
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
