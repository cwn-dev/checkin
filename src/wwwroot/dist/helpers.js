"use strict";
function getRequiredElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing element: #${id}`);
    }
    return element;
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
