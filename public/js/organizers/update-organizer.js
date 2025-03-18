document.addEventListener("DOMContentLoaded", function () {
    const organizerIdSelect = document.getElementById("organizerID");
    const updateOrganizerForm = document.getElementById("updateOrganizerForm");

    organizerIdSelect.addEventListener("change", async function () {
        const organizerID = this.value;

        if (organizerID) {
            try {
                const response = await fetch(`/organizers/${organizerID}`); // Fetch organizer data
                if (response.ok) {
                    const organizer = await response.json();
                    populateOrganizerForm(organizer); // Pre-populate form
                } else {
                    console.error("Failed to fetch organizer data.");
                }
            } catch (error) {
                console.error("Error fetching organizer data:", error);
            }
        }
    });

    function populateOrganizerForm(organizer) {
        document.getElementById("newOrganizerName").value = organizer.organizerName;
        document.getElementById("newOrganizerEmail").value = organizer.email;
        document.getElementById("newOrganizerPhone").value = organizer.phoneNumber || ""; // Use empty string if phoneNumber is null or undefined
    }

    updateOrganizerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(updateOrganizerForm);
        const organizerData = {
            organizerID: formData.get("organizerID"),
        };

        const newOrganizerName = formData.get("newOrganizerName");
        if (newOrganizerName) organizerData.newOrganizerName = newOrganizerName;

        const newOrganizerEmail = formData.get("newOrganizerEmail");
        if (newOrganizerEmail) organizerData.newOrganizerEmail = newOrganizerEmail;

        const newOrganizerPhone = formData.get("newOrganizerPhone");
        if (newOrganizerPhone) organizerData.newOrganizerPhone = newOrganizerPhone;

        try {
            const response = await fetch("/update-organizer", {
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
            window.location.reload();
        } catch (error) {
            console.error("Error updating organizer:", error);
            alert("Error updating organizer. Please try again.");
        }
    });
});