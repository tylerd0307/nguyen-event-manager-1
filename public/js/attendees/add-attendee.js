document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("addAttendeeForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const attendeeData = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            phone: formData.get("phoneNumber") || null
        };

        try {
            console.log(attendeeData);
                const response = await fetch("/add-attendee", { // Corrected URL
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(attendeeData)
            });

            if (!response.ok) {
                throw new Error("Failed to add attendee");
            }

            alert("Attendee added successfully!");
            location.reload();
        } catch (error) {
            console.error("Error:", error);
            alert("Error adding attendee. Please try again.");
        }
    });
});