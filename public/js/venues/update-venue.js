document.addEventListener("DOMContentLoaded", function () {
    const venueIdSelect = document.getElementById("venueID");
    const updateVenueForm = document.getElementById("updateVenueForm");

    venueIdSelect.addEventListener("change", async function () {
        const venueID = this.value;

        if (venueID) {
            try {
                const response = await fetch(`/venues/${venueID}`); // Fetch venue data
                if (response.ok) {
                    const venue = await response.json();
                    populateVenueForm(venue); // Pre-populate form
                } else {
                    console.error("Failed to fetch venue data.");
                }
            } catch (error) {
                console.error("Error fetching venue data:", error);
            }
        }
    });

    function populateVenueForm(venue) {
        document.getElementById("venueName").value = venue.venueName;
        document.getElementById("address").value = venue.address;
        document.getElementById("capacity").value = venue.capacity;
        document.getElementById("contactNumber").value = venue.contactNumber;
    }

    updateVenueForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(updateVenueForm);
        const venueData = {
            venueID: formData.get("venueID"),
        };

        const venueName = formData.get("venueName");
        if (venueName) venueData.venueName = venueName;

        const address = formData.get("address");
        if (address) venueData.address = address;

        const capacity = formData.get("capacity");
        if (capacity) venueData.capacity = capacity;

        const contactNumber = formData.get("contactNumber");
        if (contactNumber) venueData.contactNumber = contactNumber;

        try {
            console.log("Sending venue data:", venueData);
            const response = await fetch("/update-venue", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(venueData)
            });

            if (!response.ok) {
                throw new Error("Failed to update venue");
            }

            alert("Venue updated successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error updating venue:", error);
            alert("Error updating venue. Please try again.");
        }
    });
});