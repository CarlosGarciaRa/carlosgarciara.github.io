(function () {
  var STORAGE_THEME = "portfolio-theme";
  var DEFAULT_THEME = "obsidian-gold";

  // Aplicar tema guardado al cargar
  function aplicarTema(id) {
    document.body.setAttribute("data-theme", id || DEFAULT_THEME);
    var btns = document.querySelectorAll(".paleta-barra__btn");
    btns.forEach(function (btn) {
      btn.classList.toggle("activo", btn.getAttribute("data-theme") === (id || DEFAULT_THEME));
    });
  }

  var saved = localStorage.getItem(STORAGE_THEME);
  if (saved) aplicarTema(saved);
  else aplicarTema(DEFAULT_THEME);

  // Clic en botón de paleta
  document.querySelectorAll(".paleta-barra__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = this.getAttribute("data-theme");
      aplicarTema(id);
      localStorage.setItem(STORAGE_THEME, id);
    });
  });
})();
