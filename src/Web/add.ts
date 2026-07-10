async function initAdd() {
    var greenIcon = new L.Icon({
        iconUrl: "lib/leaflet/images/marker-icon-2x-green.png",
        shadowUrl: "lib/leaflet/images/marker-shadow.png",
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

    // When the add form is posted, turn the date value into an ISO 8601 string.
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