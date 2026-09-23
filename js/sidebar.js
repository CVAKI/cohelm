// ============================================
// Co-Helm — Sidebar
// ============================================

const CoHelmSidebar = (() => {
  function init() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    const newVoyageBtn = document.getElementById("newVoyageBtn");

    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });

    newVoyageBtn.addEventListener("click", () => {
      CoHelmChat.reset();
    });
  }

  return { init };
})();
