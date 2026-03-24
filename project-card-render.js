/**
 * Construcción de columnas/tarjetas de proyecto (compartido entre proyectos.html e index).
 */
(function (global) {
  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getLang() {
    var lang = document.documentElement.getAttribute("lang") || "es";
    return lang.startsWith("en") ? "en" : "es";
  }

  function getButtonLabels() {
    var lang = getLang();
    return lang === "en"
      ? { verDemo: "View Demo", github: "GitHub", privadoNda: "Private (NDA)" }
      : { verDemo: "Ver Demo", github: "GitHub", privadoNda: "Privado (NDA)" };
  }

  function getProjectText(p) {
    var lang = getLang();
    if (lang === "en" && (p.titleEn || p.descriptionEn)) {
      return {
        title: p.titleEn || p.title,
        description: p.descriptionEn || p.description
      };
    }
    return { title: p.title, description: p.description };
  }

  function normalizeImages(p) {
    if (!p) return [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      return p.images.filter(Boolean);
    }
    if (p.image) return [p.image];
    return [];
  }

  function prefersReducedMotion() {
    try {
      return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function initProjectCarousels(scopeEl) {
    if (!scopeEl || prefersReducedMotion()) return;
    var wraps = scopeEl.querySelectorAll('[data-project-carousel="true"]');
    wraps.forEach(function (wrap) {
      if (wrap.__carouselInitialized) return;
      wrap.__carouselInitialized = true;

      var slides = wrap.querySelectorAll(".project-card__image--slide");
      if (!slides || slides.length <= 1) return;

      var intervalMs = parseInt(wrap.getAttribute("data-carousel-interval") || "3500", 10);
      if (!intervalMs || intervalMs < 1200) intervalMs = 3500;

      var index = 0;
      var timer = null;
      var isPaused = false;

      function setActive(nextIndex) {
        slides.forEach(function (img, i) {
          if (i === nextIndex) img.classList.add("is-active");
          else img.classList.remove("is-active");
        });
        index = nextIndex;
      }

      function tick() {
        if (isPaused) return;
        var next = (index + 1) % slides.length;
        setActive(next);
      }

      function start() {
        if (timer) return;
        timer = setInterval(tick, intervalMs);
      }

      function stop() {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
      }

      wrap.addEventListener("mouseenter", function () {
        isPaused = true;
      });
      wrap.addEventListener("mouseleave", function () {
        isPaused = false;
      });

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else start();
      });

      setActive(0);
      start();
    });
  }

  /**
   * @param {object} p proyecto desde JSON
   * @param {{ outlineButtons?: boolean, uniformColumns?: boolean }} options
   */
  function buildProjectColumn(p, options) {
    options = options || {};
    var outline = !!options.outlineButtons;
    var uniform = !!options.uniformColumns;

    var col = document.createElement("div");
    col.className = uniform
      ? "col project-card-col"
      : p.isFeatured
        ? "col project-card-col col-lg-8"
        : "col project-card-col";

    var labels = getButtonLabels();
    var text = getProjectText(p);
    var isEnterprise = p.type === "enterprise";
    var badgeText = isEnterprise ? (getLang() === "en" ? "Enterprise" : "Empresa") : getLang() === "en" ? "Personal" : "Personal";
    var badgeClass = isEnterprise ? "project-card__badge--enterprise" : "project-card__badge--personal";

    var tagsHtml = (p.tags || [])
      .map(function (tag) {
        return '<span class="project-card__tag">' + escapeHtml(tag) + "</span>";
      })
      .join("");

    var images = normalizeImages(p);
    var hasCarousel = images.length > 1;
    var imageHtml = hasCarousel
      ? images
          .map(function (src, idx) {
            var cls =
              idx === 0 ? "project-card__image project-card__image--slide is-active" : "project-card__image project-card__image--slide";
            return '<img class="' + cls + '" src="' + escapeHtml(src) + '" alt="" loading="lazy" decoding="async">';
          })
          .join("")
      : '<img class="project-card__image" src="' + escapeHtml(images[0] || "") + '" alt="" loading="lazy" decoding="async">';

    var demoClass = outline ? "btn btn-outline-primary btn-sm" : "btn btn-primary btn-sm";
    var demoBtn =
      p.demoUrl && p.demoUrl !== "#"
        ? '<a href="' + escapeHtml(p.demoUrl) + '" target="_blank" rel="noopener noreferrer" class="' + demoClass + '">' + labels.verDemo + "</a>"
        : '<span class="btn btn-secondary btn-sm disabled">' + labels.verDemo + "</span>";

    var repoBtn;
    if (isEnterprise && !p.repoUrl) {
      repoBtn =
        '<button type="button" class="btn btn-outline-secondary btn-sm" disabled title="' +
        escapeHtml(labels.privadoNda) +
        '" data-bs-toggle="tooltip" data-bs-placement="top">' +
        labels.privadoNda +
        "</button>";
    } else if (p.repoUrl) {
      repoBtn =
        '<a href="' +
        escapeHtml(p.repoUrl) +
        '" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm">' +
        labels.github +
        "</a>";
    } else {
      repoBtn = '<span class="btn btn-outline-secondary btn-sm disabled">' + labels.github + "</span>";
    }

    col.innerHTML =
      '<article class="project-card surface-card surface-card--interactive card">' +
      '  <div class="project-card__image-wrap' +
      (hasCarousel ? " project-card__image-wrap--carousel" : "") +
      '"' +
      (hasCarousel ? ' data-project-carousel="true" data-carousel-interval="3500"' : "") +
      ">" +
      imageHtml +
      '    <span class="project-card__badge ' +
      badgeClass +
      '">' +
      escapeHtml(badgeText) +
      "</span>" +
      "  </div>" +
      '  <div class="project-card__body">' +
      '    <h3 class="project-card__title">' +
      escapeHtml(text.title) +
      "</h3>" +
      '    <div class="project-card__tags">' +
      tagsHtml +
      "</div>" +
      '    <p class="project-card__description">' +
      escapeHtml(text.description) +
      "</p>" +
      '    <div class="project-card__actions">' +
      demoBtn +
      repoBtn +
      "</div>" +
      "  </div>" +
      "</article>";

    return col;
  }

  global.portfolioProjectCardRender = {
    buildColumn: buildProjectColumn,
    initCarousels: initProjectCarousels,
    escapeHtml: escapeHtml,
    getLang: getLang,
    getProjectText: getProjectText,
    getButtonLabels: getButtonLabels,
    normalizeImages: normalizeImages
  };
})(window);
