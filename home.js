(function () {
  var DATA_URL = "data/projects.json";
  var homePreviewProjects = [];

  /* Mismas tecnologías que en #tecnologias (sin duplicar GCP más allá de un icono) */
  var HERO_TECH_ICON_CLASSES = [
    "devicon-vuejs-plain",
    "devicon-react-original",
    "devicon-typescript-plain",
    "devicon-javascript-plain",
    "devicon-nestjs-plain",
    "devicon-dotnetcore-plain",
    "devicon-fastapi-plain",
    "devicon-googlecloud-plain",
    "devicon-postgresql-plain",
    "devicon-mongodb-plain",
    "devicon-docker-plain",
    "devicon-azure-plain"
  ];

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function buildMarqueeGroup() {
    var g = document.createElement("div");
    g.className = "hero-tech-marquee__group";
    HERO_TECH_ICON_CLASSES.forEach(function (cls) {
      var wrap = document.createElement("span");
      wrap.className = "hero-tech-marquee__icon";
      var icon = document.createElement("i");
      icon.className = cls + " colored";
      icon.setAttribute("aria-hidden", "true");
      wrap.appendChild(icon);
      g.appendChild(wrap);
    });
    return g;
  }

  function initHeroMarquee() {
    var track = document.getElementById("hero-tech-marquee-track");
    if (!track) return;

    track.innerHTML = "";
    track.className = "hero-tech-marquee__inner";

    if (prefersReducedMotion()) {
      track.classList.add("hero-tech-marquee__inner--static");
      track.appendChild(buildMarqueeGroup());
      return;
    }

    track.appendChild(buildMarqueeGroup());
    track.appendChild(buildMarqueeGroup());
  }

  function pickPreviewProjects(all) {
    var list = Array.isArray(all) ? all.slice() : [];
    list.sort(function (a, b) {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
    return list.slice(0, 3);
  }

  function renderHomeProjectsPreview() {
    var row = document.getElementById("home-projects-preview");
    var fallback = document.getElementById("home-projects-fallback");
    if (!row) return;

    var render = window.portfolioProjectCardRender;
    if (!render || typeof render.buildColumn !== "function") {
      if (fallback) fallback.classList.remove("d-none");
      return;
    }

    row.innerHTML = "";

    if (homePreviewProjects.length === 0) {
      if (fallback) fallback.classList.remove("d-none");
      return;
    }

    if (fallback) fallback.classList.add("d-none");

    homePreviewProjects.forEach(function (p) {
      row.appendChild(render.buildColumn(p, { outlineButtons: true, uniformColumns: true }));
    });

    render.initCarousels(row);

    var tooltips = row.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
      tooltips.forEach(function (el) {
        new bootstrap.Tooltip(el);
      });
    }
  }

  function loadHomeProjects() {
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("fetch projects");
        return res.json();
      })
      .catch(function () {
        return [];
      })
      .then(function (data) {
        homePreviewProjects = pickPreviewProjects(data);
        renderHomeProjectsPreview();
      });
  }

  function initReveal() {
    var nodes = document.querySelectorAll(".reveal-section");
    if (!nodes.length) return;

    if (prefersReducedMotion()) {
      nodes.forEach(function (n) {
        n.classList.add("is-inview");
      });
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (n) {
      obs.observe(n);
    });
  }

  function boot() {
    initHeroMarquee();
    initReveal();
    loadHomeProjects();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("portfolio:langChange", function () {
    renderHomeProjectsPreview();
  });
})();
