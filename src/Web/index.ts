// leaflet.js
declare const L: any;
let map: any = null;

// TODO: attach events to the element's parent which always exists,
// that way we can set up events in an init() function which runs
// on page load and don't need to worry about the element not
// existing yet.
// In other words, attach events to #content.

async function initMap() {
    fetch('/checkins')
        .then(response => response.json())
        .then(coordinates => {
            let startLat: number;
            let startLong: number;

            if (coordinates.length > 0) {
                // Centre on a random existing checkin.
                const startingEntry = Math.floor(Math.random() * coordinates.length);
                startLat = coordinates[startingEntry].lat;
                startLong = coordinates[startingEntry].long;
            } else {
                // Centre on London if no existing checkins.
                startLat = 51.51213573156569
                startLong = -0.1823298235597972
            }

            function initMap(lat: number, long: number) {
                const mapElement = getRequiredElementById("map");

                if (mapElement.dataset.initalised) {
                    return;
                }

                mapElement.dataset.initalised = "true";

                map = L
                    .map(mapElement)
                    .setView([lat, long], 3);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
                    .addTo(map);

                coordinates.forEach((point: {
                    lat: any;
                    long: any;
                    dateTime: any;
                    note: any;
                }) => {
                    const marker = L
                        .marker([point.lat, point.long])
                        .addTo(map);

                    marker.bindPopup(`<strong>${point.dateTime}</strong><br>${point.note}`);
                });
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    pos => {
                        startLat = pos.coords.latitude;
                        startLong = pos.coords.longitude;
                        initMap(startLat, startLong);
                    },
                    err => {
                        console.warn('Geolocation failed or denied, using fallback coordinates.');
                        initMap(startLat, startLong);
                    }
                );
            } else {
                initMap(startLat, startLong);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

async function initAdd() {
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const latitude = getRequiredElementById<HTMLInputElement>("lat")
    const longitude = getRequiredElementById<HTMLInputElement>("long");
    const form = getRequiredElementById("checkin-form");

    if (!latitude || !longitude) {
        throw new Error("#latitude or #longitude element not found.");
    }

    if (!form) {
        throw new Error("Form not found");
    }

    latitude.addEventListener("input", updateMap);
    longitude.addEventListener("input", updateMap);

    const timeZoneDataList = getRequiredElementById<HTMLDataListElement>("timezoneList");
    const timeZoneInput = getRequiredElementById<HTMLInputElement>("timezoneInput");
    const timezones = Intl.supportedValuesOf("timeZone");

    let cleared = false;

    timeZoneInput.addEventListener("focus", () => {
        if (!cleared) {
            timeZoneInput.value = "";
            cleared = true;
        }
    });

    timezones.forEach(tz => {
        const option = document.createElement("option");
        const offset = getTimeZoneOffset(tz);

        option.value = tz;
        option.label = `(${offset}) ${tz}`;

        timeZoneDataList.appendChild(option);
    });

    timeZoneInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone;

    interface HtmxConfigRequestEvent extends Event {
        target: HTMLElement;
        detail: {
            parameters: Record<string, any>;
            xhr: XMLHttpRequest;
            path: string;
            triggeringEvent: Event;
        };
    }

    document.body.addEventListener(
        "htmx:configRequest",
        function (evt: Event) {
            const e = evt as HtmxConfigRequestEvent;

            const target = e.target as HTMLElement;

            if (target.id !== "checkin-form")
                return;

            const form = target as HTMLFormElement;

            const tz = (form.querySelector("#timezoneInput") as HTMLInputElement).value;
            const dateTime = (form.querySelector("#datetime") as HTMLInputElement).value;

            const iso = getIso8601DateString(tz, dateTime);

            e.detail.parameters.datetime = iso;
        }
    );

    let newMarker: any = null;

    function updateMap() {
        const latitudeElement = getRequiredElementById<HTMLInputElement>("lat");
        const longitudeElement = getRequiredElementById<HTMLInputElement>("long");

        const lat = parseFloat(latitudeElement.value);
        const lng = parseFloat(longitudeElement.value);

        if (!isNaN(lat) && !isNaN(lng)) {
            const newLatLng = [lat, lng];

            if(!newMarker) {
               newMarker = L.marker(newLatLng, { icon: greenIcon }).addTo(map); 
            }

            newMarker.setLatLng(newLatLng);
            map.setView(newLatLng, 6);
        }
    }
}

document.body.addEventListener('htmx:beforeSwap', (evt) => {
    clearModals();
});

function clearModals() {
    const modalRoot = document.getElementById("sidebar");
    
    if (modalRoot) {
        modalRoot.innerHTML = '';
    }
}

document.body.addEventListener("htmx:afterSwap", (event) => {
    initComponents(event.target as HTMLElement);
});

function initComponents(root: HTMLElement) {
    if (root.querySelector("#map")) {
        initMap();
    }

    if (root.querySelector(".add-sidebar")) {
        initAdd();
    }
}