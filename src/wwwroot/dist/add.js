"use strict";
// Centre on London
let startLat = 51.51213573156569;
let startLong = -0.1823298235597972;
const map = L.map('map').setView([startLat, startLong], 3);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);
const marker = L.marker([startLat, startLong]).addTo(map);
function updateMap() {
    const latitudeElement = getRequiredElementById("latitude");
    const longitudeElement = getRequiredElementById("longitude");
    const lat = parseFloat(latitudeElement.value);
    const lng = parseFloat(longitudeElement.value);
    if (!isNaN(lat) && !isNaN(lng)) {
        const newLatLng = [lat, lng];
        marker.setLatLng(newLatLng);
        map.setView(newLatLng, 13);
    }
}
function getTimeZoneOffset(tz) {
    const date = new Date();
    const dtParts = Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        timeZoneName: "longOffset"
    })
        .formatToParts(date);
    const offsetPart = dtParts
        .find(x => x.type === "timeZoneName");
    return offsetPart
        ? offsetPart.value.replace("GMT", "UTC")
        : "+00:00";
}
function getIso8601DateString(tz, dateTime) {
    try {
        const offset = getTimeZoneOffset(tz);
        const offsetVal = offset.replace("UTC", "");
        return `${dateTime}${offsetVal}`;
    }
    catch (error) {
        // Intentionally ignored.
    }
    return '';
}
const latitude = getRequiredElementById("latitude");
const longitude = getRequiredElementById("longitude");
const form = getRequiredElementById("checkinForm");
if (!latitude || !longitude) {
    throw new Error("#latitude or #longitude element not found.");
}
if (!form) {
    throw new Error("Form not found");
}
latitude.addEventListener("input", updateMap);
longitude.addEventListener("input", updateMap);
form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const apiKey = getRequiredElementById("apiKey");
    const note = getRequiredElementById("note");
    const long = getRequiredElementById("longitude");
    const lat = getRequiredElementById("latitude");
    const dateTime = getRequiredElementById("datetime");
    const timeZone = getRequiredElementById("timezoneInput");
    const longNumber = Number(long.value);
    const latNumber = Number(lat.value);
    if (isNaN(longNumber) || isNaN(latNumber)) {
        alert('Latitude and longitude must be numbers');
    }
    let dateTimeIso8601 = getIso8601DateString(timeZone.value, dateTime.value);
    const payload = {
        Note: note.value,
        Long: longNumber,
        Lat: latNumber,
        DateTime: dateTimeIso8601,
    };
    const resultEle = getRequiredElementById("result");
    try {
        const response = await fetch("/checkin?apiKey=" + encodeURIComponent(apiKey.value), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        });
        const text = await response.text();
        resultEle.textContent = `Status: ${response.status}\n\n${text}`;
    }
    catch (error) {
        if (error instanceof Error) {
            resultEle.textContent = error.toString();
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
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
