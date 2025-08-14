document.addEventListener("DOMContentLoaded", function () {
    // -------------------- Mood Journal Display --------------------
    const allEntries = JSON.parse(localStorage.getItem("allMoodEntries")) || [];
    const accordion = document.getElementById("journalAccordion");

    if (allEntries.length === 0) {
        accordion.innerHTML = "<p class='text-muted'>No past entries found.</p>";
        return;
    }

    // Display past entries in reverse order (newest first)
    allEntries.slice().reverse().forEach((entry, index) => {
        const entryId = `entry${index}`;
        const item = `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${entryId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#collapse${entryId}" aria-expanded="false" aria-controls="collapse${entryId}">
                        ${new Date(entry.date).toLocaleDateString()} - Mood: ${entry.mood}
                    </button>
                </h2>
                <div id="collapse${entryId}" class="accordion-collapse collapse" aria-labelledby="heading${entryId}" data-bs-parent="#journalAccordion">
                    <div class="accordion-body">
                        ${entry.journal}
                    </div>
                </div>
            </div>
        `;
        accordion.insertAdjacentHTML("beforeend", item);
    });

    // -------------------- Mood Chart (Current Month) --------------------
    const currentMonth = new Date().getMonth();
    const moodCounts = {};
    allEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getMonth() === currentMonth) {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        }
    });

    const ctx = document.getElementById("moodPieChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(moodCounts),
            datasets: [{
                label: "Mood Count",
                data: Object.values(moodCounts),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
});

// -------------------- Google Maps & Places Search --------------------
let map;
let markers = [];

function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 51.5074, lng: -0.1278 }, // London
        zoom: 10,
    });

    const service = new google.maps.places.PlacesService(map);
    const placeInput = document.getElementById("placeInput");
    const resultsList = document.getElementById("resultsList");

    placeInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            const searchTerm = placeInput.value.trim();
            if (!searchTerm) return;

            const request = {
                query: searchTerm,
                fields: ["name", "geometry", "formatted_address", "place_id"],
            };

            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displayResults(results);
                } else {
                    resultsList.innerHTML = `<p>No results found.</p>`;
                }
            });
        }
    });

    function displayResults(items) {
        resultsList.innerHTML = "";

        // Remove old markers
        markers.forEach(m => m.setMap(null));
        markers = [];

        items.forEach(item => {
            const name = item.name;
            const address = item.formatted_address;
            const latLng = item.geometry.location;
            const placeId = item.place_id;
            const googleUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

            // Add to results list
            const div = document.createElement("div");
            div.innerHTML = `
                <strong>${name}</strong><br>
                ${address}<br>
                <a href="${googleUrl}" target="_blank">More info</a>
                <hr>
            `;
            resultsList.appendChild(div);

            // Add marker to map
            const marker = new google.maps.Marker({
                map,
                position: latLng,
            });
            const infoWindow = new google.maps.InfoWindow({
                content: `<strong>${name}</strong><br>${address}`
            });
            marker.addListener("click", () => infoWindow.open(map, marker));
            markers.push(marker);
        });

        // Fit map to markers
        if (markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => bounds.extend(marker.getPosition()));
            map.fitBounds(bounds);
        }
    }
}
