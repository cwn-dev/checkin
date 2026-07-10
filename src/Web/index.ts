// leaflet.js
declare const L: any;
let map: any = null;

document.body.addEventListener("htmx:beforeSwap", (_) => {
    clearModals();
});

document.body.addEventListener("htmx:afterSwap", (event) => {
    initComponents(event.target as HTMLElement);
});

// Clear all modals when current body is swapped.
function clearModals() {
    const modalRoot = document.getElementById("sidebar");
    
    if (modalRoot) {
        modalRoot.innerHTML = '';
    }
}

// Run JS init functions when particular elements are available, after swap.
function initComponents(root: HTMLElement) {
    if (root.querySelector("#map")) {
        initMap();
    }

    if (root.querySelector(".add-sidebar")) {
        initAdd();
    }
}