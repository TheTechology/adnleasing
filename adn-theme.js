(function () {
  function apply(theme) {
    if (theme === "dark") document.documentElement.setAttribute("data-adn-theme", "dark");
    else document.documentElement.removeAttribute("data-adn-theme");
    var label = theme === "dark" ? "Temă deschisă" : "Temă întunecată";
    var nodes = document.querySelectorAll("[data-adn-theme-label]");
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = label;
  }
  function current() {
    return document.documentElement.getAttribute("data-adn-theme") === "dark" ? "dark" : "light";
  }
  function saved() {
    try { return localStorage.getItem("adn-theme"); } catch (e) { return null; }
  }
  var initial = saved() === "dark" ? "dark" : "light";
  apply(initial);
  document.addEventListener("DOMContentLoaded", function () { apply(current()); });
  window.setTimeout(function () { apply(current()); }, 400);
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-adn-theme-toggle]") : null;
    if (!t) return;
    var next = current() === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("adn-theme", next); } catch (err) {}
  });
})();

(function () {
  function close() { document.body.classList.remove("adn-drawer-open"); }
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-adn-drawer-toggle]") : null;
    if (t) { e.preventDefault(); document.body.classList.toggle("adn-drawer-open"); return; }
    if (e.target && e.target.closest && (e.target.closest("[data-adn-drawer-close]") || e.target.closest(".adn-drawer-veil"))) close();
    else if (e.target && e.target.closest && e.target.closest(".adn-drawer-panel a")) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1000) close(); });
})();

(function () {
  var header = null;
  var lastY = window.scrollY || 0;
  var hidden = false;
  var ticking = false;
  function setHidden(next) {
    if (!header) header = document.querySelector(".adn-site-header");
    if (!header || next === hidden) return;
    header.classList.toggle("adn-header-hidden", next);
    hidden = next;
  }
  function onScroll() {
    var y = window.scrollY || 0;
    var delta = y - lastY;
    if (document.body.classList.contains("adn-drawer-open")) {
      lastY = y; ticking = false; return;
    }
    if (y <= 80) setHidden(false);
    else if (delta > 6) setHidden(true);
    else if (delta < -6) setHidden(false);
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
})();
