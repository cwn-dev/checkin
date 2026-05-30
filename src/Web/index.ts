// leaflet.js
declare const L: any;

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

        function init(lat: number, long: number) {
            const map = L
                .map('map', {
                    preferCanvas: true
                })
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
                    init(startLat, startLong);
                },
                err => {
                    console.warn('Geolocation failed or denied, using fallback coordinates.');
                    init(startLat, startLong);
                }
            );
        } else {
            init(startLat, startLong);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });