(function () {
  var nav = document.getElementById("siteNavbar");
  var offcanvasEl = document.getElementById("navOffcanvas");

  function updateScrolled() {
    if (!nav) return;
    nav.classList.toggle("navbar-scrolled", window.scrollY > 50);
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        updateScrolled();
        ticking = false;
      });
    }
  }

  if (nav) {
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrolled();
  }

  if (offcanvasEl && typeof bootstrap !== "undefined" && bootstrap.Offcanvas) {
    offcanvasEl.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a || !offcanvasEl.contains(a)) return;
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      var inst = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (inst) inst.hide();
    });
  }
})();
