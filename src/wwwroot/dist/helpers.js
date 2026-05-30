"use strict";
function getRequiredElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing element: #${id}`);
    }
    return element;
}
