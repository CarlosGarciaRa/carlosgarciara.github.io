(function () {
  var GRID_ID = "projects-grid";
  var DATA_URL = "data/projects.json";
  var currentFilter = "all";
  var allProjects = [];

  function matchesFilter(project) {
    if (currentFilter === "all") return true;
    if (currentFilter === "enterprise") return project.type === "enterprise";
    if (currentFilter === "personal") return project.type === "personal";
    if (currentFilter === "web") return project.categories && project.categories.indexOf("web") !== -1;
    if (currentFilter === "mobile") return project.categories && project.categories.indexOf("mobile") !== -1;
    return true;
  }

  function fetchProjects() {
    return fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudo cargar projects.json");
        return res.json();
      })
      .catch(function (err) {
        console.warn("fetchProjects error:", err);
        return [];
      });
  }

  function renderProjects(projects) {
    var grid = document.getElementById(GRID_ID);
    if (!grid) return;
    var render = window.portfolioProjectCardRender;
    if (!render || typeof render.buildColumn !== "function") {
      console.warn("portfolioProjectCardRender no disponible; carga project-card-render.js antes de projects.js");
      return;
    }

    grid.classList.add("is-filtering");
    grid.innerHTML = "";

    setTimeout(function () {
      grid.classList.remove("is-filtering");

      if (projects.length === 0) {
        var empty = document.createElement("div");
        empty.className = "col-12 text-center py-5 text-secondary";
        empty.setAttribute("data-i18n", "proyectos.proximamente");
        empty.textContent = document.documentElement.lang === "en" ? "Content coming soon." : "Contenido próximamente.";
        grid.appendChild(empty);
        return;
      }

      projects.forEach(function (p) {
        grid.appendChild(render.buildColumn(p, { outlineButtons: false, uniformColumns: false }));
      });

      render.initCarousels(grid);

      var tooltips = grid.querySelectorAll('[data-bs-toggle="tooltip"]');
      if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
        tooltips.forEach(function (el) {
          new bootstrap.Tooltip(el);
        });
      }
    }, 150);
  }

  function applyFilter() {
    var filtered = currentFilter === "all" ? allProjects : allProjects.filter(matchesFilter);
    renderProjects(filtered);
  }

  function initFilters() {
    document.querySelectorAll('input[name="projectFilter"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        currentFilter = this.value;
        applyFilter();
      });
    });
  }

  function init() {
    fetchProjects().then(function (data) {
      allProjects = Array.isArray(data) ? data : [];
      applyFilter();
    });
    initFilters();
    window.addEventListener("portfolio:langChange", function () {
      if (allProjects.length > 0) {
        applyFilter();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
