declare const ExifReader: any;
let newMarker: any = null;

async function initAdd() {
    const note = getRequiredElementById<HTMLInputElement>("note");
    const latitude = getRequiredElementById<HTMLInputElement>("lat")
    const longitude = getRequiredElementById<HTMLInputElement>("long");
    const img = getRequiredElementById<HTMLInputElement>("img");
    const dateTime = getRequiredElementById<HTMLInputElement>("datetime");

    latitude.addEventListener("input", onFormInput);
    longitude.addEventListener("input", onFormInput);
    note.addEventListener("input", onFormInput);
    dateTime.addEventListener("input", onFormInput);
    img.addEventListener("input", onImageInput);

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

            e.detail.parameters.Datetime = iso;
        }
    );

    function onFormInput(_: Event) {
        addMarker(
            latitude.value,
            longitude.value,
            dateTime.value,
            note.value
        );
    }

    async function onImageInput(event: Event) {
        const e = event.target as HTMLInputElement;
        const files = e.files;

        if (!files) {
            return;
        }

        const imgMetaData = await extractMetadata(files);

        const tzItem = (document
            .querySelector<HTMLInputElement>(
                `#timezoneList [data-offset="${imgMetaData.Timezone ?? "+00:00"}"]`
            ) as HTMLInputElement).value;

        latitude.value = imgMetaData.Latitude;
        longitude.value = imgMetaData.Longitude;
        dateTime.value = imgMetaData.DateTime;
        timeZoneInput.value = tzItem;

        addMarker(
            imgMetaData.Latitude,
            imgMetaData.Longitude,
            imgMetaData.DateTime
        );
    }
}

function addMarker(latitude: string, longitude: string, dateTime: string, note?: string) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
        const newLatLng = [lat, lng];

        if (!newMarker) {
            newMarker = L.marker(newLatLng, { icon: greenIcon }).addTo(map);
        }

        newMarker.setLatLng(newLatLng);

        newMarker.bindPopup(
            `<strong>${dateTime}</strong><br>${note}`);

        map.setView(newLatLng, 7);
    }
}

async function extractMetadata(files: FileList): Promise<ImageMetadata> {
    const tags = await ExifReader.load(files[0]);
    const dateCreated = tags["DateCreated"].description;
    const gpsLatitudeUnsigned = tags["GPSLatitude"].description;
    const gpsLongitudeUnsigned = tags["GPSLongitude"].description;
    const gpsLongitudeRef = tags["GPSLongitudeRef"].description;
    const gpsLatitudeRef = tags["GPSLatitudeRef"].description;
    // const gpsAltitude = tags['GPSAltitude'].description;

    let gpsLatitude = gpsLatitudeUnsigned as string;
    let gpsLongitude = gpsLongitudeUnsigned as string;

    const dateRegex: RegExp = /(\d*-\d*-\d*T\d*:\d*:\d*)(\+\d*:\d*)?/;
    const dateItems: RegExpMatchArray = dateCreated.match(dateRegex);

    if (gpsLongitudeRef === "West longitude") {
        gpsLongitude = `-${gpsLongitude}`;
    }

    if (gpsLatitudeRef === "South latitude") {
        gpsLatitude = `-${gpsLatitude}`;
    }

    var imgMetaData: ImageMetadata = {
        Latitude: gpsLatitude,
        Longitude: gpsLongitude,
        DateTime: dateItems[1],
        Timezone: dateItems[2],
    }

    return imgMetaData;
}

function closeAdd() {
    newMarker.remove();
    newMarker = null;

    clearModals();
}

const greenIcon = new L.Icon({
    iconUrl: "lib/leaflet/images/marker-icon-2x-green.png",
    shadowUrl: "lib/leaflet/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface HtmxConfigRequestEvent extends Event {
    readonly detail: {
        readonly parameters: Record<string, any>;
    };
}

interface ImageMetadata {
    readonly Latitude: string;
    readonly Longitude: string;
    readonly DateTime: string;
    readonly Timezone: string | undefined;
}