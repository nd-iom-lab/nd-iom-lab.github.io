export function labNewsDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Indiana/Indianapolis",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = type => parts.find(part => part.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function partitionNews(entries, today = labNewsDate()) {
  const [year, month, day] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year - 1, month, 0)).getUTCDate();
  const cutoff = new Date(Date.UTC(year - 1, month - 1, Math.min(day, lastDay)))
    .toISOString().slice(0, 10);
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  return {
    recent: sorted.filter(entry => entry.date >= cutoff && entry.date <= today),
    older: sorted.filter(entry => entry.date < cutoff),
  };
}
