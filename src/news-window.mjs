export function labNewsDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Indiana/Indianapolis",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = type => parts.find(part => part.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function partitionNews(entries, today = labNewsDate()) {
  const all = [...entries]
    .filter(entry => entry.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return {
    recent: all.slice(0, 5),
    all,
  };
}

// The build and the date-aware browser refresh render exactly the same cards.
export function renderNewsCard(entry, index = 0, headingLevel = 2) {
  const escape = value => String(value ?? "").replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const date = new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${entry.date}T12:00:00Z`));
  const image = entry.image;
  const heading = headingLevel === 3 ? "h3" : "h2";
  return `<li class="news-card" data-category="${escape(entry.category)}" data-date="${escape(entry.date)}"><article class="news-card-inner"><a class="news-image"${image.crop ? ` data-crop="${escape(image.crop)}"` : ""}${image.kind === "logo" ? ' data-cover="logo"' : ""} href="${escape(image.src)}" aria-label="Enlarge image: ${escape(image.alt)}"><img src="${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="${index < 3 ? "eager" : "lazy"}" decoding="async">${image.label ? `<span class="news-cover-label" aria-hidden="true">${escape(image.label)}</span>` : ""}</a><div class="news-card-copy"><div class="news-card-meta"><time datetime="${escape(entry.date)}">${escape(date)}</time>${entry.category ? `<span>${escape(entry.category)}</span>` : ""}</div><${heading}>${escape(entry.title)}</${heading}><div class="news-card-body">${entry.bodyHtml}</div></div></article></li>`;
}
