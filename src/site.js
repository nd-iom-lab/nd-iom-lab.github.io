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
const homeHero = document.querySelector(".hero-fade");
if (homeHero) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pendingFrame = false;
  const updateHero = () => {
    const progress = Math.min(1, Math.max(0, window.scrollY) / 200);
    const opacity = reducedMotion.matches ? 1 : 1 - progress * progress * (3 - 2 * progress);
    homeHero.style.setProperty("--hero-opacity", opacity.toFixed(3));
    pendingFrame = false;
  };
  const requestUpdate = () => {
    if (!pendingFrame) {
      pendingFrame = true;
      window.requestAnimationFrame(updateHero);
    }
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("pageshow", requestUpdate);
  reducedMotion.addEventListener("change", requestUpdate);
  updateHero();
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
if (newsList) {
  fetch(newsList.dataset.newsSrc)
    .then(response => { if (!response.ok) throw new Error("News unavailable"); return response.json(); })
    .then(entries => {
      const news = partitionNews(entries)[newsList.dataset.newsList];
      newsList.innerHTML = news.map(entry => entry.html).join("");
    })
    .catch(() => {}); // The server-rendered list remains usable if the feed is unavailable.
}

const lightbox = document.querySelector(".publication-lightbox");
if (lightbox) {
  const enlarged = lightbox.querySelector(".lightbox-image");
  document.querySelectorAll(".publication-image").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      enlarged.src = link.href;
      enlarged.alt = link.querySelector("img").alt;
      lightbox.showModal();
      document.body.classList.add("image-viewer-open");
    });
  });
  lightbox.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("image-viewer-open");
    enlarged.removeAttribute("src");
  });
}
