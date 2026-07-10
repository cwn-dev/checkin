"use strict";
let map = null;
document.body.addEventListener("htmx:beforeSwap", (_) => {
    clearModals();
});
document.body.addEventListener("htmx:afterSwap", (event) => {
    initComponents(event.target);
});
// Clear all modals when current body is swapped.
function clearModals() {
    const modalRoot = document.getElementById("sidebar");
    if (modalRoot) {
        modalRoot.innerHTML = '';
    }
}
// Run JS init functions when particular elements are available, after swap.
function initComponents(root) {
    if (root.querySelector("#map")) {
        initMap();
    }
    if (root.querySelector(".add-sidebar")) {
        initAdd();
    }
}
