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
