(function () {
  var STORAGE_THEME = "portfolio-theme";
  var DEFAULT_THEME = "obsidian-gold";
  // var CONTACT_API_URL = "https://flwry.dev/api/contact/";
  var CONTACT_API_URL = "https://api.flwry.dev/api/contact/";

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

  function initContactForm() {
    var form = document.querySelector(".formulario-contacto");
    if (!form) return;

    var submitButton = form.querySelector(".formulario-contacto__submit");
    var submitText = form.querySelector(".formulario-contacto__submit-texto");
    var spinner = form.querySelector(".formulario-contacto__spinner");
    var statusBox = form.querySelector(".formulario-contacto__estado");
    var nameInput = form.querySelector("#contacto-nombre");
    var emailInput = form.querySelector("#contacto-email");
    var messageInput = form.querySelector("#contacto-mensaje");
    var websiteInput = form.querySelector('input[name="website"]');
    var fieldErrorBoxes = {
      nombre: form.querySelector('[data-field-error="nombre"]'),
      email: form.querySelector('[data-field-error="email"]'),
      mensaje: form.querySelector('[data-field-error="mensaje"]')
    };
    var fieldNodes = {
      nombre: nameInput,
      email: emailInput,
      mensaje: messageInput
    };
    var isSubmitting = false;

    function t(key, fallback) {
      if (typeof window.portfolioGetI18n === "function") {
        var translated = window.portfolioGetI18n(key);
        if (typeof translated === "string" && translated.trim()) {
          return translated;
        }
      }
      return fallback;
    }

    function setStatus(type, message) {
      if (!statusBox) return;
      statusBox.textContent = message;
      statusBox.hidden = !message;
      statusBox.classList.remove("is-success", "is-error");
      if (message) {
        statusBox.classList.add(type === "success" ? "is-success" : "is-error");
      }
    }

    function clearFieldErrors() {
      Object.keys(fieldErrorBoxes).forEach(function (key) {
        var box = fieldErrorBoxes[key];
        var field = fieldNodes[key];
        if (box) {
          box.textContent = "";
          box.hidden = true;
        }
        if (field) {
          field.classList.remove("is-invalid");
        }
      });
    }

    function showFieldError(fieldName, message) {
      var box = fieldErrorBoxes[fieldName];
      var field = fieldNodes[fieldName];
      if (!box || !field || !message) return;
      box.textContent = message;
      box.hidden = false;
      field.classList.add("is-invalid");
    }

    function getValidationErrors(payload) {
      var errors = {};
      var normalizedEmail = payload.email.trim();

      if (!payload.name || !payload.name.trim()) {
        errors.nombre = t("contacto.estado.errores.nombreRequerido", "El nombre es obligatorio.");
      } else if (payload.name.trim().length > 100) {
        errors.nombre = t("contacto.estado.errores.nombreMax", "El nombre debe tener como máximo 100 caracteres.");
      }

      if (!normalizedEmail) {
        errors.email = t("contacto.estado.errores.emailRequerido", "El email es obligatorio.");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        errors.email = t("contacto.estado.errores.emailInvalido", "El formato del email no es válido.");
      }

      if (!payload.message || !payload.message.trim()) {
        errors.mensaje = t("contacto.estado.errores.mensajeRequerido", "El mensaje es obligatorio.");
      } else if (payload.message.trim().length > 2000) {
        errors.mensaje = t("contacto.estado.errores.mensajeMax", "El mensaje debe tener como máximo 2000 caracteres.");
      }

      return errors;
    }

    function mapApiErrorToField(message) {
      var normalized = (message || "").toLowerCase();
      if (normalized.indexOf("name") !== -1) return "nombre";
      if (normalized.indexOf("email") !== -1) return "email";
      if (normalized.indexOf("message") !== -1) return "mensaje";
      return null;
    }

    function setLoadingState(loading) {
      isSubmitting = loading;
      form.classList.toggle("formulario-contacto--loading", loading);
      if (submitButton) {
        submitButton.disabled = loading;
        submitButton.setAttribute("aria-disabled", loading ? "true" : "false");
      }
      if (spinner) {
        spinner.classList.toggle("is-visible", loading);
      }
      if (submitText) {
        submitText.textContent = loading
          ? t("contacto.form.enviando", "Enviando...")
          : t("contacto.form.enviar", "Enviar");
      }
    }

    async function onSubmit(event) {
      event.preventDefault();
      if (isSubmitting) return;

      clearFieldErrors();
      setStatus("", "");

      var payload = {
        name: (nameInput && nameInput.value ? nameInput.value : "").trim(),
        email: (emailInput && emailInput.value ? emailInput.value : "").trim(),
        message: (messageInput && messageInput.value ? messageInput.value : "").trim(),
        website: websiteInput && typeof websiteInput.value === "string" ? websiteInput.value : ""
      };

      var localErrors = getValidationErrors(payload);
      var localErrorKeys = Object.keys(localErrors);
      if (localErrorKeys.length > 0) {
        localErrorKeys.forEach(function (fieldName) {
          showFieldError(fieldName, localErrors[fieldName]);
        });
        setStatus("error", t("contacto.estado.validacion", "Revisa los campos marcados e intenta nuevamente."));
        return;
      }

      setLoadingState(true);

      try {
        var response = await fetch(CONTACT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        var data = {};
        try {
          data = await response.json();
        } catch (parseError) {
          data = {};
        }

        if (response.status === 201 || response.status === 200) {
          form.reset();
          setStatus("success", t("contacto.estado.exito", "Mensaje enviado correctamente."));
          return;
        }

        if (response.status === 422) {
          var apiErrorMessage = typeof data.error === "string" ? data.error : "";
          var targetField = mapApiErrorToField(apiErrorMessage);
          if (targetField) {
            showFieldError(targetField, apiErrorMessage);
          }
          setStatus("error", apiErrorMessage || t("contacto.estado.validacion", "Revisa los campos marcados e intenta nuevamente."));
          return;
        }

        if (response.status === 429) {
          setStatus("error", t("contacto.estado.rateLimit", "Demasiadas solicitudes. Intenta nuevamente en unos minutos."));
          return;
        }

        setStatus("error", t("contacto.estado.error", "No se pudo enviar el mensaje. Intenta de nuevo."));
      } catch (error) {
        setStatus("error", t("contacto.estado.errorRed", "Error de red. Verifica tu conexión e intenta de nuevo."));
      } finally {
        setLoadingState(false);
      }
    }

    form.addEventListener("submit", onSubmit);
    window.addEventListener("portfolio:langChange", function () {
      if (!isSubmitting && submitText) {
        submitText.textContent = t("contacto.form.enviar", "Enviar");
      }
    });
  }

  initContactForm();
})();
