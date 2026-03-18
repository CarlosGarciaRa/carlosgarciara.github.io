(function () {
  var STORAGE_LANG = "portfolio-lang";
  var DEFAULT_LANG = "es";
  var currentLang = DEFAULT_LANG;
  var translations = {};
  var isInitialized = false;

  // Detectar idioma del navegador o usar default
  function detectLanguage() {
    var saved = localStorage.getItem(STORAGE_LANG);
    if (saved && (saved === "es" || saved === "en")) {
      return saved;
    }
    var browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.toLowerCase().startsWith("en")) {
      return "en";
    }
    return DEFAULT_LANG;
  }

  // Cargar traducciones desde JSON
  function loadTranslations(lang) {
    return fetch("i18n/" + lang + ".json")
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to load translations");
        return response.json();
      })
      .catch(function (error) {
        console.warn("Error loading translations:", error);
        if (lang !== DEFAULT_LANG) {
          return loadTranslations(DEFAULT_LANG);
        }
        return {};
      });
  }

  // Obtener valor de objeto anidado por path (ej: "nav.inicio")
  function getNestedValue(obj, path) {
    return path.split(".").reduce(function (current, key) {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Aplicar traducciones a elementos con data-i18n
  function applyTranslations() {
    var elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var value = getNestedValue(translations, key);
      if (value !== null) {
        // Reemplazar {año} si existe
        if (typeof value === "string" && value.includes("{año}")) {
          value = value.replace("{año}", new Date().getFullYear());
        }
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          if (el.type === "submit" || el.type === "button") {
            el.value = value;
          } else {
            el.placeholder = value;
          }
        } else if (el.hasAttribute("placeholder")) {
          el.placeholder = value;
        } else {
          el.textContent = value;
        }
      }
    });

    // Actualizar footer crédito
    var creditoEl = document.getElementById("footer-credito");
    if (creditoEl) {
      var creditoText = getNestedValue(translations, "footer.credito");
      if (creditoText && typeof creditoText === "string") {
        creditoText = creditoText.replace("{año}", new Date().getFullYear());
        creditoEl.textContent = creditoText;
      }
    }

    // Actualizar enlaces de descarga de CV según idioma
    var cvLinks = document.querySelectorAll("#cv-download-link, #cv-download-link-experiencia");
    cvLinks.forEach(function (link) {
      var cvPath = currentLang === "en" 
        ? "assets/docs/cv-en.pdf"
        : "assets/docs/cv-es.pdf";
      link.setAttribute("href", cvPath);
    });

    // Manejar arrays (ej: lista de servicios)
    var arrayElements = document.querySelectorAll("[data-i18n-array]");
    arrayElements.forEach(function (container) {
      var key = container.getAttribute("data-i18n-array");
      var items = getNestedValue(translations, key);
      if (Array.isArray(items)) {
        var listItems = container.querySelectorAll("li");
        items.forEach(function (text, index) {
          if (listItems[index]) {
            var textNode = listItems[index].querySelector("span[data-i18n-text]");
            if (textNode) {
              textNode.textContent = text;
            } else {
              listItems[index].textContent = text;
            }
          }
        });
      }
    });

    // Actualizar atributo lang del HTML
    document.documentElement.setAttribute("lang", currentLang);

    // Notificar a otros módulos (ej. proyectos) que el idioma cambió
    try {
      window.dispatchEvent(new CustomEvent("portfolio:langChange", { detail: { lang: currentLang } }));
    } catch (e) {}
  }

  // Cambiar idioma
  function cambiarIdioma(lang) {
    if (lang === currentLang && isInitialized) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_LANG, lang);
    loadTranslations(lang).then(function (data) {
      translations = data;
      applyTranslations();
      updateLanguageSelector();
    });
  }

  // Actualizar selector de idioma (marcar activo)
  function updateLanguageSelector() {
    var selectors = document.querySelectorAll(".lang-selector");
    selectors.forEach(function (selector) {
      var options = selector.querySelectorAll("option");
      options.forEach(function (option) {
        option.selected = option.value === currentLang;
      });
    });
  }

  // Inicializar i18n
  function init() {
    currentLang = detectLanguage();
    loadTranslations(currentLang).then(function (data) {
      translations = data;
      isInitialized = true;
      applyTranslations();
      updateLanguageSelector();

      // Event listeners para selector de idioma
      document.querySelectorAll(".lang-selector").forEach(function (selector) {
        selector.addEventListener("change", function () {
          cambiarIdioma(this.value);
        });
      });
    });
  }

  // Exponer función globalmente para uso manual si es necesario
  window.cambiarIdioma = cambiarIdioma;
  window.getCurrentLang = function () {
    return currentLang;
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
