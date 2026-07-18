"use strict";
function initList() {
    const checkinElements = document.querySelectorAll(".journal-entry");
    checkinElements.forEach(c => {
        c.addEventListener("click", checkinElementClick);
    });
}
function checkinElementClick(event) {
    map
        .setView([
        event.currentTarget.dataset.latitude,
        event.currentTarget.dataset.longitude
    ], 3);
}
