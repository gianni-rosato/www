(function () {
  function warm(root) {
    root.querySelectorAll(".metric-switch-img").forEach(function (img) {
      img.loading = "eager";
      if (typeof img.decode === "function") {
        img.decode().catch(function () {});
      }
    });
  }

  function warmAll() {
    document.querySelectorAll("[data-metric-switch]").forEach(warm);
  }

  function enhanceAll() {
    document.querySelectorAll("[data-metric-switch]").forEach(function (root) {
      root.classList.add("is-enhanced");
    });

    // Decode every frame ahead of time so the first switch is instant.
    if ("requestIdleCallback" in window) {
      requestIdleCallback(warmAll, { timeout: 3000 });
    } else {
      setTimeout(warmAll, 1000);
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".metric-switch-btn");
    if (!button) return;

    var root = button.closest("[data-metric-switch]");
    if (!root) return;

    var index = button.getAttribute("data-metric-index");

    root.querySelectorAll(".metric-switch-btn").forEach(function (btn) {
      var isActive = btn.getAttribute("data-metric-index") === index;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    root.querySelectorAll(".metric-switch-img").forEach(function (img) {
      img.classList.toggle("is-active", img.getAttribute("data-metric-index") === index);
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceAll);
  } else {
    enhanceAll();
  }
})();
