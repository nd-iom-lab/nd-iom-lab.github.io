import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { build, root } from "./build.mjs";
import { partitionNews, labNewsDate } from "../src/news-window.mjs";
build();
const dist = path.join(root, "dist");
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
}
const pages = files(dist).filter((f) => f.endsWith(".html"));
const styles = readFileSync(path.join(root, "src/styles.css"), "utf8");
const script = readFileSync(path.join(dist, "site.js"), "utf8");
for (const page of pages) {
  const text = readFileSync(page, "utf8");
  assert.ok(text.includes(`<style>${styles}</style>`), `${page}: self-contained styles`);
  assert.ok(text.includes(`</main><script>${script}</script>`), `${page}: script after page content`);
  assert.doesNotMatch(text, /<link\b[^>]*rel="stylesheet"|<script\b[^>]*src=/, `${page}: no separate CSS/JS load`);
  assert.match(text, /<meta name="viewport"/);
  assert.match(text, /<main id="main">/);
  assert.equal(
    (text.match(/<h1\b/g) || []).length,
    1,
    `${page}: one primary heading`,
  );
  assert.doesNotMatch(
    text,
    /<(?:script|link|img)[^>]+(?:wixstatic|parastorage|wix.com)/,
    `${page}: no Wix runtime/assets`,
  );
  for (const [, href] of text.matchAll(/(?:src|href)="(\/[^"#]*)"/g)) {
    const asset = path.join(dist, decodeURIComponent(href));
    assert.ok(
      existsSync(asset) || existsSync(path.join(asset, "index.html")),
      `${page}: missing local reference ${href}`,
    );
  }
  for (const [, target] of text.matchAll(/href="#([^"]+)"/g))
    assert.ok(
      text.includes(`id="${target}"`),
      `${page}: missing anchor ${target}`,
    );
}
// Old HTML can outlive a deployment in the browser or CDN cache.
assert.ok(existsSync(path.join(dist, "styles-b4fa8f9e41.css")), "Restore the previously missing stylesheet");
for (const name of readdirSync(path.join(root, "public"))) {
  const match = /^(?:styles|site)-([a-f0-9]{10})\.(?:css|js)$/.exec(name);
  if (!match) continue;
  const content = readFileSync(path.join(dist, name));
  assert.equal(createHash("sha256").update(content).digest("hex").slice(0, 10), match[1], `${name}: preserve exact historical content`);
}
const pubs = JSON.parse(
  readFileSync(path.join(root, "content/publications.json")),
);
assert.ok(pubs.length >= 17);
for (const p of pubs) {
  assert.ok(p.title);
  assert.match(p.date, /^\d{4}-\d{2}-\d{2}$/, `${p.title}: ISO publication date`);
  assert.equal(new Date(p.date).toISOString().slice(0, 10), p.date, `${p.title}: valid publication date`);
  assert.ok(p.images.length);
  assert.ok(p.authors && p.venue);
  assert.doesNotMatch(p.authors, /<[^>]+>/, `${p.title}: plain author names`);
}
const t = JSON.parse(readFileSync(path.join(root, "content/team.json")));
assert.ok(t.members.length >= 11);
assert.equal(t.pi.office, "Office: 182D Fitzpatrick Hall");
assert.equal(t.pi.email, "tcheng2@nd.edu");
const home = JSON.parse(readFileSync(path.join(root, "content/home.json")));
assert.ok(home.news.length >= 7);
for (const entry of home.news) {
  assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(entry.date).toISOString().slice(0, 10), entry.date);
}
const testNews = ["2025-01-01", "2026-10-02", "2026-06-01", "2026-01-01", "2026-05-01", "2026-04-01", "2026-03-01", "2026-02-01"].map(date => ({ date }));
const selected = partitionNews(testNews, "2026-10-01");
assert.deepEqual(selected.recent.map(entry => entry.date), ["2026-06-01", "2026-05-01", "2026-04-01", "2026-03-01", "2026-02-01"]);
assert.equal(selected.all.length, 7, "Keep every published entry on News");
assert.equal(selected.all.at(-1).date, "2025-01-01", "Retain old entries");
assert.equal(testNews[0].date, "2025-01-01", "Selection does not mutate source order");
assert.equal(partitionNews([{ date: "2023-02-28" }], "2026-10-01").recent.length, 1, "No rolling age cutoff");
assert.equal(labNewsDate(new Date("2026-10-02T02:00:00Z")), "2026-10-01");
const homepage = readFileSync(path.join(dist, "index.html"), "utf8");
assert.match(homepage, /href="\/news\/">More News<\/a>/);
const published = partitionNews(home.news);
const renderedNews = (html, kind) => html.match(new RegExp(`<ul[^>]*data-news-list="${kind}"[^>]*>([\\s\\S]*?)</ul>`))[1];
assert.equal(renderedNews(homepage, "recent"), published.recent.map(entry => entry.html).join(""));
assert.equal(published.recent.length, 5);
const newsPage = readFileSync(path.join(dist, "news/index.html"), "utf8");
assert.equal(renderedNews(newsPage, "all"), published.all.map(entry => entry.html).join(""));
assert.equal(renderedNews(readFileSync(path.join(dist, "older-news/index.html"), "utf8"), "all"), renderedNews(newsPage, "all"));
const navigation = JSON.parse(readFileSync(path.join(root, "content/site.json"))).navigation;
assert.deepEqual(navigation.slice(1, 4).map(item => item.path), ["/news/", "/team/", "/s-projects-basic/"]);
assert.match(newsPage, /href="\/news\/" aria-current="page"/);
assert.doesNotMatch(homepage, /class="older-news"/);
const pubPage = readFileSync(path.join(dist, "s-projects-basic/index.html"), "utf8");
assert.doesNotMatch(pubPage, /year-filter|project-meta/);
assert.match(pubPage, /publication-lightbox/);
assert.equal(home.gallery.length, 9);
console.log(
  `PASS: ${pages.length} pages, local assets/routes/anchors, content integrity and no Wix runtime.`,
);
