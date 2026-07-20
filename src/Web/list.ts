function initList() {
    const checkinElements = document.querySelectorAll(".journal-entry");

    checkinElements.forEach(c => {
        c.addEventListener("click", checkinElementClick);
    });
}

function checkinElementClick(event: any) {
    map
        .setView(
            [
                event.currentTarget.dataset.latitude,
                event.currentTarget.dataset.longitude
            ], 8);
}