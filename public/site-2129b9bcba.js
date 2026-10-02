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

const publicationFilters = document.querySelector(".publication-filters");
if (publicationFilters) {
  const buttons = [...publicationFilters.querySelectorAll("button")];
  const years = [...document.querySelectorAll(".publication-year")];
  const status = document.querySelector(".publication-status");
  publicationFilters.hidden = false;
  buttons.forEach(button => button.addEventListener("click", () => {
    const selected = button.dataset.publicationFilter;
    let count = 0;
    buttons.forEach(other => other.setAttribute("aria-pressed", String(other === button)));
    years.forEach(year => {
      year.hidden = selected !== "all" && year.dataset.publicationYear !== selected;
      if (!year.hidden) count += year.querySelectorAll(".project").length;
    });
    status.textContent = `${count} ${count === 1 ? "publication" : "publications"}${selected === "all" ? "" : ` in ${selected}`}`;
  }));
}
