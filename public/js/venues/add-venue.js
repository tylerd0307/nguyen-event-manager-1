document.addEventListener("DOMContentLoaded", function () {
    const addVenueForm = document.getElementById("addVenueForm");

    addVenueForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form from refreshing the page

        // Gather form data
        const formData = new FormData(addVenueForm);
        const venueData = {
            venueName: formData.get("venueName"),
            address: formData.get("address"),
            capacity: formData.get("capacity"),
            contactNumber: formData.get("contactNumber")
        };

        try {
            const response = await fetch("/add-venue", { // Assuming you have this route in app.js
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(venueData)
            });

            if (!response.ok) {
                throw new Error("Failed to add venue");
            }

            alert("Venue added successfully!");
            window.location.reload(); // Refresh to show the updated list
        } catch (error) {
            console.error("Error adding venue:", error);
            alert("Error adding venue. Please try again.");
        }
    });
});