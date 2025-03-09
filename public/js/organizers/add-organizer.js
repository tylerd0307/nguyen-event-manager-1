// add-organizer.js
document.addEventListener("DOMContentLoaded", function () {
    const addOrganizerForm = document.getElementById("addOrganizerForm");

    addOrganizerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(addOrganizerForm);
        const organizerData = {
            organizerName: formData.get("organizerName"),
            email: formData.get("email"),
            phone: formData.get("phone")
        };

        try {
            const response = await fetch("/add-organizer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(organizerData)
            });

            if (!response.ok) {
                throw new Error("Failed to add organizer");
            }

            alert("Organizer added successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error adding organizer:", error);
            alert("Error adding organizer. Please try again.");
        }
    });
});