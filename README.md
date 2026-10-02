# Internet of Matter Lab — code-managed website

Independent static reconstruction of https://www.internetofmatter.org, captured October 1, 2026. The existing Wix site and domain are unchanged. This folder is the source of truth for the new preview, separate from the Wix/Velo repository in `../lab-website`.

## Preview and build

Requires Node.js 20+; there are no runtime or build dependencies to install.

```sh
cd "/Users/allenliu/Documents/ChatGPT/Lab Web/code-site"
npm run dev
```

Open http://localhost:4321. Content, CSS, JS and asset edits rebuild automatically; refresh the browser to see them. Restart the server after editing the generator in `scripts/build.mjs`.

```sh
npm run check    # Build and validate local routes, images, anchors and content
npm run build    # Generate the complete deployable website in dist/
npm run preview # Serve the generated website without watching edits
```

The preview server listens on the local network as well, so a phone/iPad on the same reachable network can use the computer's LAN address on port 4321. Browser viewport tests are recorded in `qa/responsive.json`; they are not physical-device testing.

## Update content entirely through code

- `content/site.json`: brand, shared header images and navigation.
- `content/team.json`: PI, members, alumni text and group photos.
- `content/publications.json`: publication/project entries, in display order.
- `content/home.json`: opening, news, vision, research text, gallery and affiliations.
- `content/teaching.json`, `content/opportunities.json`: their respective content.
- `content/archive.json`: the old hidden `/publications/` page, retained for existing links.
- `src/styles.css`: desktop design and mobile/tablet layout rules.
- `src/site.js`: mobile menu and research gallery controls.
- `scripts/build.mjs`: semantic static HTML templates.
- `public/assets/`: local images and fonts. Add new images here; reference them as `/assets/filename.webp`.

No Wix account, Wix editor, computer use, CMS or external API is needed to edit/build this version. Existing external paper, project, personal-site and recruitment-form links retain their original destinations.

### Add a team member

Add an object to `members` in `content/team.json` and place the portrait in `public/assets/`. Use `null` for `url` when there is no personal page.

```json
{
  "name": "New Member",
  "roleHtml": "<p>PhD student</p>",
  "url": "https://example.org/",
  "portrait": { "src": "/assets/new-member.webp", "alt": "New Member" }
}
```

The grid lays out new members automatically; no position/height edits are required.

Group photos retain complete images with their natural aspect ratios. The original three-image rows are justified using each image’s `width` and `height` (its natural pixel dimensions). This aligns both row heights and outer edges without cropping. Include those dimensions when adding group photos; do not apply a fixed height or `object-fit: cover` to this section.

### Add a publication/project

Insert this object at the top of `content/publications.json` (replace all example values):

```json
{
  "title": "Paper title",
  "meta": "10/01/2026    Research topic",
  "authors": "Author One, Author Two, Tingyu Cheng",
  "venue": "Conference 2026",
  "links": [
    { "label": "PDF", "url": "https://example.org/paper.pdf" },
    { "label": "Project Page", "url": "https://example.org/project/" }
  ],
  "images": [{ "src": "/assets/new-project.webp", "alt": "Project illustration" }]
}
```

Existing imported entries use `detailsHtml` to preserve their exact author/venue/link/award formatting. For those entries, edit that field directly; it takes precedence over `authors`, `venue` and `links`. Optional `titleUrl` links the title. Optional `award` displays award text.

### Add news

Insert an object at the top of `news` in `content/home.json`. The `html` field currently contains the complete list item including the visible date; update both `date` and that visible date together.

```json
{
  "date": "10/01/2026",
  "html": "<li><p>10/01/2026 Our paper was accepted to <strong>Conference 2026</strong>.</p></li>"
}
```

HTML fields are trusted lab-maintained source, not submitted by website visitors. Check changes with `npm run check`, preview in the browser, then commit the data/images/styles with Git.

## Responsive behavior

Desktop retains the pale header, original typography, five-image wave strip, centered content, circular portraits and alternating project rows. Tablet layouts wrap navigation and use three member columns. Mobile has a collapsible menu, two member columns and stacked project text/images. The same content is statically rendered at every size; there are no separate mobile page copies.

## Migration record

`migration/assets.json` records original public image URLs; `migration/optimized-assets.json` maps them to local WebP files. Original images and public HTML snapshots remain locally available in `migration/` but are excluded from Git and the public build. `migration/content-parity.json` records a word-level comparison against all six original pages, with no missing words. Image exports keep the hero's original 3341-pixel width and use high-quality WebP; the complete local asset folder is approximately 13 MB instead of 138 MB.

The Python import/download scripts and `scripts/optimize-assets.mjs` are one-time migration tools. Normal editing/building never runs them. The importer requires Python with lxml; optimization requires sharp (`SHARP_MODULE` can point to an existing installation). Do not re-run import on edited content: it overwrites migrated data.

## Deployment later

`dist/` is an ordinary static website and can be served on a separate preview hostname by GitHub Pages, Cloudflare Pages, Netlify, a university server, or another static host. Keep the current Wix domain/DNS untouched until the preview has been accepted. There is intentionally no production deployment command or domain binding here.
