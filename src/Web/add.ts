declare const ExifReader: any;
let newMarker: any = null;

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
    const img = getRequiredElementById<HTMLInputElement>("img");
    const dateTime = getRequiredElementById<HTMLInputElement>("datetime");

    latitude.addEventListener("input", updateMap);
    longitude.addEventListener("input", updateMap);
    img.addEventListener("input", updateImg);

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
        option.dataset.offset = offset.slice(-6);

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

    function updateMap() {
        const latitudeElement = getRequiredElementById<HTMLInputElement>("lat");
        const longitudeElement = getRequiredElementById<HTMLInputElement>("long");

        const lat = parseFloat(latitudeElement.value);
        const lng = parseFloat(longitudeElement.value);

        if (!isNaN(lat) && !isNaN(lng)) {
            const newLatLng = [lat, lng];

            if (!newMarker) {
                newMarker = L.marker(newLatLng, { icon: greenIcon }).addTo(map);
            }

            newMarker.setLatLng(newLatLng);
            map.setView(newLatLng, 7);
        }
    }

    async function updateImg(event: any) {
        const e = event.target as HTMLInputElement;
        const files = e.files;

        if (!files) {
            return;
        }

        const tags = await ExifReader.load(files[0]);
        const dateCreated = tags["DateCreated"].description;
        const gpsLatitudeUnsigned = tags["GPSLatitude"].description;
        const gpsLongitudeUnsigned = tags["GPSLongitude"].description;
        const gpsLongitudeRef = tags["GPSLongitudeRef"].description;
        const gpsLatitudeRef = tags["GPSLatitudeRef"].description;
        // const gpsAltitude = tags['GPSAltitude'].description;

        let gpsLatitude = gpsLatitudeUnsigned;
        let gpsLongitude = gpsLongitudeUnsigned;

        const dateRegex: RegExp = /(\d*-\d*-\d*T\d*:\d*:\d*)(\+\d*:\d*)?/;
        const dateItems = dateCreated.match(dateRegex);

        if (gpsLongitudeRef === "West longitude") {
            gpsLongitude = `-${gpsLongitude}`;
        }

        if (gpsLatitudeRef === "South latitude") {
            gpsLatitude = `-${gpsLatitude}`;
        }

        const tzItem = (document
            .querySelector<HTMLInputElement>(
                `#timezoneList [data-offset="${dateItems[2] ?? "+00:00"}"]`
            ) as HTMLInputElement).value;

        timeZoneInput.value = tzItem;
        latitude.value = gpsLatitude;
        longitude.value = gpsLongitude;
        dateTime.value = dateItems[1];

        updateMap();
    }
}

function closeAdd() {
    newMarker.remove();
    newMarker = null;

    clearModals();
}