// ============================================
// Co-Helm — Fullscreen Toggle
// ============================================

const CoHelmFullscreen = (() => {
  let toggleBtn, expandIcon, collapseIcon;

  function isFullscreen() {
    return !!document.fullscreenElement;
  }

  function updateIcon() {
    if (isFullscreen()) {
      expandIcon.classList.add("hidden");
      collapseIcon.classList.remove("hidden");
      toggleBtn.title = "Exit Fullscreen";
    } else {
      expandIcon.classList.remove("hidden");
      collapseIcon.classList.add("hidden");
      toggleBtn.title = "Toggle Fullscreen";
    }
  }

  async function toggle() {
    try {
      if (!isFullscreen()) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      // Some browsers block fullscreen without a direct user gesture,
      // or it's unsupported (e.g. inside certain embedded webviews).
      console.warn("Co-Helm: fullscreen request failed", err);
    }
  }

  function init() {
    toggleBtn = document.getElementById("fullscreenToggleBtn");
    expandIcon = document.getElementById("fullscreenExpandIcon");
    collapseIcon = document.getElementById("fullscreenCollapseIcon");

    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", toggle);
    document.addEventListener("fullscreenchange", updateIcon);

    updateIcon();
  }

  return { init };
})();