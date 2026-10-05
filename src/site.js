const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
function closeMenu() {
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation");
  nav.classList.remove("open");
}
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  nav.classList.toggle("open", open);
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    toggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    toggle.focus();
  }
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
const heroShell = document.querySelector(".hero-shell");
if (heroShell) {
  const motionButton = heroShell.querySelector(".hero-motion");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  let inView = true;
  const updateMotion = () => {
    heroShell.classList.toggle("has-motion", !reducedMotion.matches);
    heroShell.classList.toggle("is-paused", paused || !inView || document.hidden);
    motionButton.hidden = reducedMotion.matches;
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.setAttribute("aria-label", paused ? "Resume photo animation" : "Pause photo animation");
  };
  motionButton.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  });
  reducedMotion.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", updateMotion);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateMotion();
    }).observe(heroShell.querySelector(".hero"));
  }
  updateMotion();
}
const publicationFilters = document.querySelector(".publication-filters");
if (publicationFilters) {
  const buttons = [...publicationFilters.querySelectorAll("button")];
  const papers = [...document.querySelectorAll(".project[data-themes]")];
  const years = [...document.querySelectorAll(".publication-year")];
  const status = document.querySelector(".publication-filter-status");
  publicationFilters.hidden = false;
  buttons.forEach(button => button.addEventListener("click", () => {
    const theme = button.dataset.publicationFilter;
    buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    papers.forEach(paper => {
      paper.hidden = theme !== "all" && !paper.dataset.themes.split(" ").includes(theme);
    });
    years.forEach(year => {
      const visible = [...year.querySelectorAll(".project")].filter(paper => !paper.hidden);
      year.hidden = visible.length === 0;
      visible.forEach((paper, index) => paper.classList.toggle("alternate", index % 2 === 0));
    });
    const count = papers.filter(paper => !paper.hidden).length;
    status.textContent = `${count} ${count === 1 ? "publication" : "publications"} shown: ${button.textContent}.`;
  }));
  years.forEach(year => [...year.querySelectorAll(".project")].forEach((paper, index) => paper.classList.toggle("alternate", index % 2 === 0)));
}
const gallery = document.querySelector(".gallery");
if (gallery) {
  const slides = [...gallery.querySelectorAll("figure")];
  let index = 0;
  gallery.querySelectorAll("[data-gallery]").forEach((button) =>
    button.addEventListener("click", () => {
      slides[index].hidden = true;
      index =
        (index + (button.dataset.gallery === "next" ? 1 : -1) + slides.length) %
        slides.length;
      slides[index].hidden = false;
      gallery.querySelector(".gallery-count").textContent =
        `${index + 1} / ${slides.length}`;
    }),
  );
}

const newsList = document.querySelector("[data-news-list]");
const newsWall = document.querySelector(".news-wall");
let refreshNewsWall = () => {};
if (newsWall) {
  const filters = document.querySelector(".news-filters");
  const buttons = [...filters.querySelectorAll("button")];
  let category = "All";
  let frame;
  const layout = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rowHeight = parseFloat(getComputedStyle(newsWall).gridAutoRows);
      newsWall.querySelectorAll(".news-card:not([hidden])").forEach(card => {
        const height = card.querySelector(".news-card-inner").getBoundingClientRect().height;
        card.style.gridRowEnd = `span ${Math.ceil((height + 52) / rowHeight)}`;
      });
    });
  };
  // Natural image heights create the stagger; DOM and keyboard order stay chronological.
  newsWall.classList.add("is-masonry");
  const observer = new ResizeObserver(layout);
  let width = 0;
  new ResizeObserver(entries => {
    const next = entries[0].contentRect.width;
    if (next !== width) { width = next; layout(); }
  }).observe(newsWall);
  const applyFilter = () => {
    newsWall.querySelectorAll(".news-card").forEach(card => {
      card.hidden = category !== "All" && card.dataset.category !== category;
    });
    layout();
  };
  refreshNewsWall = () => {
    observer.disconnect();
    newsWall.querySelectorAll(".news-card-inner").forEach(card => observer.observe(card));
    applyFilter();
  };
  filters.hidden = false;
  buttons.forEach(button => button.addEventListener("click", () => {
    category = button.dataset.newsFilter;
    buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    applyFilter();
  }));
  document.fonts.ready.then(layout);
  window.addEventListener("resize", layout);
  refreshNewsWall();
}
if (newsList) {
  fetch(newsList.dataset.newsSrc)
    .then(response => { if (!response.ok) throw new Error("News unavailable"); return response.json(); })
    .then(entries => {
      const news = partitionNews(entries)[newsList.dataset.newsList];
      const html = newsWall ? news.map(renderNewsCard).join("") : news.map(entry => entry.html).join("");
      if (newsList.innerHTML !== html) {
        newsList.innerHTML = html;
        refreshNewsWall();
      }
    })
    .catch(() => {}); // The server-rendered list remains usable if the feed is unavailable.
}

const lightbox = document.querySelector(".publication-lightbox");
if (lightbox) {
  const enlarged = lightbox.querySelector(".lightbox-image");
  document.addEventListener("click", event => {
      const link = event.target.closest(".publication-image, .news-image");
      if (!link) return;
      event.preventDefault();
      enlarged.src = link.href;
      enlarged.alt = link.querySelector("img").alt;
      lightbox.showModal();
      document.body.classList.add("image-viewer-open");
  });
  lightbox.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("image-viewer-open");
    enlarged.removeAttribute("src");
  });
}
