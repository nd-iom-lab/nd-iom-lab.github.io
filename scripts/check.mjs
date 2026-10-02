import assert from "node:assert/strict";
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
for (const page of pages) {
  const text = readFileSync(page, "utf8");
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
const boundaryNews = ["2025-10-01", "2025-09-30", "2026-10-01", "2026-10-02"].map(date => ({ date }));
assert.deepEqual(partitionNews(boundaryNews, "2026-10-01"), {
  recent: [{ date: "2026-10-01" }, { date: "2025-10-01" }],
  older: [{ date: "2025-09-30" }],
});
assert.equal(partitionNews([{ date: "2023-02-28" }], "2024-02-29").recent.length, 1);
assert.equal(labNewsDate(new Date("2026-10-02T02:00:00Z")), "2026-10-01");
const homepage = readFileSync(path.join(dist, "index.html"), "utf8");
assert.match(homepage, /href="\/older-news\/"/);
assert.doesNotMatch(homepage, /class="older-news"/);
const pubPage = readFileSync(path.join(dist, "s-projects-basic/index.html"), "utf8");
assert.doesNotMatch(pubPage, /year-filter|project-meta/);
assert.match(pubPage, /publication-lightbox/);
assert.equal(home.gallery.length, 9);
console.log(
  `PASS: ${pages.length} pages, local assets/routes/anchors, content integrity and no Wix runtime.`,
);
