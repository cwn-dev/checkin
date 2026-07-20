"use strict";
let newMarker = null;
async function initAdd() {
    var greenIcon = new L.Icon({
        iconUrl: "lib/leaflet/images/marker-icon-2x-green.png",
        shadowUrl: "lib/leaflet/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    const latitude = getRequiredElementById("lat");
    const longitude = getRequiredElementById("long");
    const img = getRequiredElementById("img");
    const dateTime = getRequiredElementById("datetime");
    latitude.addEventListener("input", updateMap);
    longitude.addEventListener("input", updateMap);
    img.addEventListener("input", updateImg);
    const timeZoneDataList = getRequiredElementById("timezoneList");
    const timeZoneInput = getRequiredElementById("timezoneInput");
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
    document.body.addEventListener("htmx:configRequest", function (evt) {
        const e = evt;
        const target = e.target;
        if (target.id !== "checkin-form")
            return;
        const form = target;
        const tz = form.querySelector("#timezoneInput").value;
        const dateTime = form.querySelector("#datetime").value;
        const iso = getIso8601DateString(tz, dateTime);
        e.detail.parameters.datetime = iso;
    });
    function updateMap() {
        const latitudeElement = getRequiredElementById("lat");
        const longitudeElement = getRequiredElementById("long");
        const lat = parseFloat(latitudeElement.value);
        const lng = parseFloat(longitudeElement.value);
        if (!isNaN(lat) && !isNaN(lng)) {
            const newLatLng = [lat, lng];
            if (!newMarker) {
                newMarker = L.marker(newLatLng, { icon: greenIcon }).addTo(map);
            }
            newMarker.setLatLng(newLatLng);
            map.setView(newLatLng, 8);
        }
    }
    async function updateImg(event) {
        const e = event.target;
        const files = e.files;
        if (!files) {
            return;
        }
        const tags = await ExifReader.load(files[0]);
        const dateCreated = tags['DateCreated'].description;
        const gpsLatitudeUnsigned = tags['GPSLatitude'].description;
        const gpsLongitudeUnsigned = tags['GPSLongitude'].description;
        const gpsLongitudeRef = tags['GPSLongitudeRef'].description;
        const gpsLatitudeRef = tags['GPSLatitudeRef'].description;
        // const gpsAltitude = tags['GPSAltitude'].description;
        const offset = dateCreated.slice(-6);
        let gpsLatitude = gpsLatitudeUnsigned;
        let gpsLongitude = gpsLongitudeUnsigned;
        // console.log(tags);
        // console.log(dateCreated.slice(0, 19));
        // console.log('TZ', dateCreated.slice(-6));
        // console.log('Lat', gpsLatitude, 'Long', gpsLongitude);
        // console.log('Altitude', gpsAltitude);
        // TODO: Finish this off, and make gpsLongitudeRef const again
        if (gpsLongitudeRef === "West longitude") {
            gpsLongitude = `-${gpsLongitude}`;
        }
        if (gpsLatitudeRef === 'South latitude') {
            gpsLatitude = `-${gpsLatitude}`;
        }
        latitude.value = gpsLatitude;
        longitude.value = gpsLongitude;
        dateTime.value = dateCreated.slice(0, 19);
        const tzItem = document
            .querySelector(`#timezoneList [data-offset="${offset}"]`).value;
        if (!tzItem) {
            return;
        }
        timeZoneInput.value = tzItem;
        updateMap();
    }
}
function closeAdd() {
    newMarker.remove();
    newMarker = null;
    clearModals();
}
