document.addEventListener("DOMContentLoaded", function () {
    const updateVenueForm = document.getElementById("updateVenueForm");

    updateVenueForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(updateVenueForm);
        const venueData = {
            venueID: formData.get("venueID"),
            venueName: formData.get("venueName"),
            address: formData.get("address"),
            capacity: formData.get("capacity"),
            contactNumber: formData.get("contactNumber")
        };

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