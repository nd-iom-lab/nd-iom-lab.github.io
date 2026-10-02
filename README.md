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

