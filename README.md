# Internet of Matter Lab — code-managed website

Independent static reconstruction of https://www.internetofmatter.org, captured October 1, 2026. The production website is hosted by GitHub Pages at https://www.internetofmatter.org. This folder is the source of truth, separate from the retained Wix/Velo repository in `../lab-website`. The original Wix site remains in the Wix account as a backup.

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
- `content/publications.json`: publication/project entries with dates for chronological ordering.
- `content/home.json`: opening, news, vision, research text, gallery and affiliations.
- `content/teaching.json`, `content/opportunities.json`: their respective content.
- `content/archive.json`: the old hidden `/publications/` page, retained for existing links.
- `src/styles.css`: desktop design and mobile/tablet layout rules.
- `src/site.js`: mobile menu, publication theme filters, research gallery controls, rolling news lists and publication image viewer.
- `scripts/build.mjs`: semantic static HTML templates.
- `public/assets/`: local images and fonts. Add new images here; reference them as `/assets/filename.webp`.

Browser tab icons use the transparent vector `public/assets/lab-favicon.svg` with a 64 px PNG fallback, configured in `content/site.json` under `favicon`. The vector preserves the original lab logo silhouette and has no background rectangle. Keep favicon assets separate from the page-header logo.

Each generated page embeds the complete stylesheet and runs its JavaScript after the page content. This keeps cached HTML and its presentation/behavior together, preventing an unstyled page when a deployment replaces external asset versions. Exact historical `styles-*.css` and `site-*.js` files in `public/`, plus the stable `styles.css` and `site.js` build outputs, support previously cached pages; retain these compatibility files. `npm run check` verifies embedded assets and historical file hashes. Projects & Publications groups entries by year, newest first, without year filter buttons. The Full Publication List offers All, Sensing & Interactions, Multimodal, Robotics and Sustainability filters; entries may match several themes. Empty year groups are hidden for the selected filter; without JavaScript the full list is displayed. Paper titles are bold and colored; authors are plain text, followed by a bold venue, awards/media coverage and icon resource buttons. Images always sit to the left of the text on desktop/tablet, at natural proportions and variable sizes, and open a dismissible image viewer. Entries remain readable when JavaScript is disabled; thumbnail links then open the image directly.

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

Group photos retain complete images with their natural aspect ratios. Rows normally contain three images; a final group of four is split into two rows of two to avoid an oversized single-photo row. Each row is justified using the images’ `width` and `height` (their natural pixel dimensions), aligning row heights and outer edges without cropping. Include those dimensions when adding group photos; do not apply a fixed height or `object-fit: cover` to this section. On mobile, rows of two stay paired and the third image of a three-image row spans the full width.

### Add a publication/project

Insert this object at the top of `content/publications.json` (replace all example values):

```json
{
  "title": "Paper title",
  "date": "2026-10-01",
  "authors": "Author One, Author Two, Tingyu Cheng",
  "venue": "Proceedings of the CHI Conference on Human Factors in Computing Systems (CHI), 2026",
  "links": [
    { "label": "PDF", "url": "https://example.org/paper.pdf" },
    { "label": "Project Page", "url": "https://example.org/project/" }
  ],
  "images": [{ "src": "/assets/new-project.webp", "alt": "Project illustration" }]
}
```

Use plain text for `authors` and `venue`. List authors in the paper’s original order, using given name then surname and consistent spelling across papers (for example, `Tingyu Cheng` and `HyunJoo Oh`); preserve equal-contribution asterisks. Use the full venue name, an acronym in parentheses where applicable, then a comma and year (for example, `Nature Electronics, 2026`). Media marks are capped below the adjacent text size. Optional `titleUrl` links the title. Resources in `links` render as icon buttons; supported labels include PDF, Project Page, Code, DOI and Video. Optional `resourceLabels` are unavailable resources, clearly marked “soon” without a link. Optional `highlights` is an array of `{ "label": "...", "brand": "nd", "url": "https://..." }` for media/awards, or `{ "label": "Best Paper", "icon": "trophy" }` for a paper award (use `icon: "ribbon"` for other recognition). Highlights appear between the venue and resource buttons. Marks live under `public/assets/marks/`; their official sources are recorded in `migration/publication-marks.json`. Seattle Times and The Daily use text initials where an original downloadable mark is unavailable.

Add `themes` as an array using `sensing`, `multimodal`, `robotics` and/or `sustainability` for the publication filters; choose every relevant category. Optional `imageShare` sets the desktop/tablet image column percentage (20–50, default 38); use a larger share for wide figures. Optional `widthPercent` on each image sets its relative column weight when a paper has multiple images. Images preserve their natural aspect ratios and are not cropped to matching boxes. Mobile uses compact images beside titles, with authors, venues and resources full width below.

The ISO `date` controls year grouping and chronological order and is not displayed on each paper. The generator sorts entries automatically.

### Add news

Keep all news in `news` in `content/home.json`, using ISO dates. The homepage shows only the five newest published news entries. More News links to `/news/`, which contains all published news in newest-first order, including the five shown on Home. News appears immediately after Home, followed by Team and Projects & Publications in the navigation. `/older-news/` remains available as an alias for existing links. The shared `src/news-window.mjs` helper uses the lab’s Indianapolis timezone to exclude future entries. Both the build and browser use the same selection logic; the static list remains readable if the news feed is unavailable or JavaScript is disabled.

The `html` field contains the complete list item including the visible date; update both `date` and that visible date together.

```json
{
  "date": "2026-10-01",
  "html": "<li><p>10/01/2026 Our paper was accepted to <strong>Conference 2026</strong>.</p></li>"
}
```

HTML fields are trusted lab-maintained source, not submitted by website visitors. Check changes with `npm run check`, preview in the browser, then commit the data/images/styles with Git.

## Responsive behavior

The shared header stays at the top while scrolling, with an 80 px desktop bar, 72 px tablet bar and 64 px mobile bar (plus a 1 px divider). Tablet and mobile use a dropdown menu. The original five-image wave appears only on the homepage: 320 px on desktop, 260 px on tablet and 180 px on mobile, with its original clear wave edges and no scroll fade. Inner pages begin directly below the navigation.

Desktop retains the original typography, centered content, circular portraits and publication rows with images on the left, text on the right and alternating pale backgrounds. Tablet layouts use a compact menu and three member columns. Mobile has a collapsible menu, two member columns and compact publication thumbnails beside titles, with authors and resources using the full available width below. The same content is statically rendered at every size; there are no separate mobile page copies.

## Migration record

`migration/assets.json` records original public image URLs; `migration/optimized-assets.json` maps them to local WebP files. Original images and public HTML snapshots remain locally available in `migration/` but are excluded from Git and the public build. `migration/content-parity.json` records a word-level comparison against all six original pages, with no missing words. Image exports keep the hero's original 3341-pixel width and use high-quality WebP; the complete local asset folder is approximately 13 MB instead of 138 MB.

The Python import/download scripts and `scripts/optimize-assets.mjs` are one-time migration tools. Normal editing/building never runs them. The importer requires Python with lxml; optimization requires sharp (`SHARP_MODULE` can point to an existing installation). Do not re-run import on edited content: it overwrites migrated data.

## Production deployment

Source repository: https://github.com/nd-iom-lab/nd-iom-lab.github.io

GitHub Pages publishes the output of `.github/workflows/deploy.yml`. Every push to `main` runs `npm run check` and publishes only `dist/`. Credentials, source data files, migration snapshots and QA files are not part of the hosted build. The repository is public and contains only the lab website source and assets.

For the local `codex/code-migration` branch, after checking and committing changes:

```sh
git push origin HEAD:main
```

Use the dedicated lab GitHub account. The deployment status is visible in the repository's Actions tab. A failed check blocks publication, preserving the last successful deployment.

### Domain and rollback

The Pages custom domain is `www.internetofmatter.org`. DNS remains managed by Wix with the original Wix nameservers. Current records:

- Root domain A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- `www` CNAME: `nd-iom-lab.github.io`.
- `_github-pages-challenge-nd-iom-lab` TXT: the verification record supplied by GitHub; keep it to preserve domain ownership verification for the organization.

The previous A/CNAME values are recorded in `deployment/dns-before.json`. To restore the Wix website, restore those records in Wix DNS and remove the fourth GitHub A record. Allow DNS caches to refresh. Keep the Wix site and plan available until the migration has been stable; no Wix site or subscription was deleted or cancelled.

To undo a website content change while keeping GitHub Pages, revert its Git commit and push to `main`.
