document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("updateAttendeeForm").addEventListener("submit", async function (event) {
        console.log("Update Attendee Form Submitted");
        event.preventDefault();

        const formData = new FormData(this);
        const attendeeData = {
            attendeeID: formData.get("attendeeID"),
            newAttendeeFirstName: formData.get("newAttendeeFirstName"),
            newAttendeeLastName: formData.get("newAttendeeLastName"),
            newAttendeeEmail: formData.get("newAttendeeEmail"),
            newAttendeePhone: formData.get("newAttendeePhone") || null
        };

        try {
            const response = await fetch("/update-attendee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(attendeeData)
            });

            if (!response.ok) {
                throw new Error("Failed to update attendee");
            }
            const result = await response.json();
            console.log(result);

            alert(result.success);
            // Optionally, reload the table data after the update
            location.reload();
        } catch (error) {
            console.error("Error updating attendee:", error);
            alert("Error updating attendee. Please try again.");
        }
    });
});
