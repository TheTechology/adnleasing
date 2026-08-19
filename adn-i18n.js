(function () {
  var DICT = {};
  var PATTERNS = [];
  var originals = new WeakMap();
  var translatedTo = new WeakMap();
  var lang = "ro";
  var busy = false;

  function stored() {
    try { return localStorage.getItem("adn-lang"); } catch (e) { return null; }
  }

  function lookup(text) {
    var key = String(text).replace(/\s+/g, " ").trim();
    if (DICT[key]) return DICT[key];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = PATTERNS[i].re.exec(key);
      if (m) return PATTERNS[i].build(m);
    }
    return text;
  }

  function translateText(key) {
    if (DICT[key]) return DICT[key];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = PATTERNS[i].re.exec(key);
      if (m) return PATTERNS[i].build(m);
    }
    return null;
  }

  function translateNode(node) {
    var raw = node.nodeValue;
    if (!raw) return;
    // React reuses text nodes across re-renders, so the same node can carry
    // different Romanian strings over its lifetime — a plain "already seen
    // this node" flag would freeze it after the first translation. Instead,
    // skip only when the node's current value is exactly what WE last wrote:
    // that's our own translation echoing back through the MutationObserver
    // in boot(), not new content that needs translating.
    if (translatedTo.get(node) === raw) return;
    var key = raw.replace(/\s+/g, " ").trim();
    if (!key) return;
    var hit = translateText(key);
    if (!hit || hit === key) return;
    if (!originals.has(node)) originals.set(node, raw);
    var next = raw.replace(key, hit);
    translatedTo.set(node, next);
    node.nodeValue = next;
  }

  function restoreNode(node) {
    if (!originals.has(node)) return;
    node.nodeValue = originals.get(node);
    originals.delete(node);
    translatedTo.delete(node);
  }

  function walk(root, fn) {
    if (!root) return;
    if (root.nodeType === 3) { fn(root); return; }
    if (root.nodeType !== 1) return;
    var tag = root.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    var it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = it.nextNode())) fn(n);
  }

  function attrs(root, apply) {
    if (!root || root.nodeType !== 1) return;
    var list = root.querySelectorAll ? root.querySelectorAll("[placeholder], [aria-label], [title]") : [];
    var all = root.matches && (root.hasAttribute("placeholder") || root.hasAttribute("aria-label") || root.hasAttribute("title")) ? [root].concat([].slice.call(list)) : [].slice.call(list);
    all.forEach(function (el) {
      ["placeholder", "aria-label", "title"].forEach(function (a) {
        var v = el.getAttribute(a);
        if (!v) return;
        var storeKey = "__adn_" + a;
        if (apply) {
          var hit = translateText(v.replace(/\s+/g, " ").trim());
          if (hit) {
            if (!el[storeKey]) el[storeKey] = v;
            el.setAttribute(a, hit);
          }
        } else if (el[storeKey]) {
          el.setAttribute(a, el[storeKey]);
        }
      });
    });
  }

  function apply(next, root) {
    busy = true;
    var scope = root || document.body;
    if (next === "en") {
      walk(scope, translateNode);
      attrs(scope, true);
    } else {
      walk(scope, restoreNode);
      attrs(scope, false);
    }
    document.documentElement.setAttribute("lang", next === "en" ? "en" : "ro");
    var labels = document.querySelectorAll("[data-adn-lang-label]");
    for (var i = 0; i < labels.length; i++) labels[i].textContent = next === "en" ? "EN" : "RO";
    busy = false;
  }

  window.adnI18n = {
    add: function (map) {
      Object.keys(map).forEach(function (k) { DICT[k.replace(/\s+/g, " ").trim()] = map[k]; });
      if (lang === "en") apply("en");
    },
    addPatterns: function (list) {
      list.forEach(function (p) { PATTERNS.push(p); });
      if (lang === "en") apply("en");
    },
    lang: function () { return lang; },
    lookup: function (text) { return lang === "en" ? lookup(text) : text; },
    set: function (next) {
      lang = next === "en" ? "en" : "ro";
      try { localStorage.setItem("adn-lang", lang); } catch (e) {}
      apply(lang);
    }
  };

  lang = stored() === "en" ? "en" : "ro";

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-adn-lang-toggle]") : null;
    if (!t) return;
    e.preventDefault();
    window.adnI18n.set(lang === "en" ? "ro" : "en");
  });

  function boot() {
    apply(lang);
    var obs = new MutationObserver(function (muts) {
      if (busy || lang !== "en") return;
      busy = true;
      muts.forEach(function (m) {
        if (m.type === "characterData") translateNode(m.target);
        for (var i = 0; i < m.addedNodes.length; i++) {
          walk(m.addedNodes[i], translateNode);
          attrs(m.addedNodes[i], true);
        }
      });
      busy = false;
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.setTimeout(function () { apply(lang); }, 600);
  window.setTimeout(function () { apply(lang); }, 1600);
})();
