"use strict";
async function initAdd() {
    var greenIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    const latitude = getRequiredElementById("lat");
    const longitude = getRequiredElementById("long");
    const form = getRequiredElementById("checkin-form");
    if (!latitude || !longitude) {
        throw new Error("#latitude or #longitude element not found.");
    }
    if (!form) {
        throw new Error("Form not found");
    }
    latitude.addEventListener("input", updateMap);
    longitude.addEventListener("input", updateMap);
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
        timeZoneDataList.appendChild(option);
    });
    timeZoneInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
    let newMarker = null;
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
            map.setView(newLatLng, 6);
        }
    }
}
