document.addEventListener("DOMContentLoaded", function () {
    const updateOrganizerForm = document.getElementById("updateOrganizerForm");

    updateOrganizerForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form from refreshing the page

        // Gather form data
        const formData = new FormData(updateOrganizerForm);
        const organizerData = {
            organizerID: formData.get("organizerID"),
            newOrganizerName: formData.get("newOrganizerName"),
            newOrganizerEmail: formData.get("newOrganizerEmail"),
            newOrganizerPhone: formData.get("newOrganizerPhone")
        };

        try {
            const response = await fetch("/update-organizer", { // Assuming you have this route in app.js
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(organizerData)
            });

            if (!response.ok) {
                throw new Error("Failed to update organizer");
            }

            alert("Organizer updated successfully!");
            window.location.reload(); // Refresh to show the updated list
        } catch (error) {
            console.error("Error updating organizer:", error);
            alert("Error updating organizer. Please try again.");
        }
    });
});