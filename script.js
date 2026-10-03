const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
    const isOpen = document.body.classList.contains("menu-open");
    toggle.setAttribute("aria-expanded", isOpen);
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMenu(); toggle.focus();
    }
  });
  window.matchMedia('(max-width: 980px)').addEventListener('change', event => {
    if (!event.matches) closeMenu();
  });
}

navLinks.forEach((link) => {
  const current = window.location.pathname.split("/").pop() || "index.html";
  const href = link.getAttribute("href");
  if (href === current) link.classList.add("active");
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const subject = encodeURIComponent("Photography inquiry from " + (data.get("name") || "website visitor"));
    const body = encodeURIComponent(
      [
        `Name: ${data.get("name") || ""}`,
        `Email: ${data.get("email") || ""}`,
        `Session: ${data.get("session") || ""}`,
        `Message: ${data.get("message") || ""}`,
        `Marketing consent: ${data.get("consent") ? "Yes" : "No"}`,
      ].join("\n")
    );
    window.location.href = `mailto:Lilyfloresm@hotmail.com?subject=${subject}&body=${body}`;
  });
}
