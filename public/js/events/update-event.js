document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("updateEventForm").addEventListener("submit", async function (event) {
        console.log("Update Event Form Submitted");
        event.preventDefault();

        const formData = new FormData(this);
        const eventData = {
            eventID: formData.get("updateEventID"),
            eventName: formData.get("newEventName"),
            eventDate: formData.get("newEventDate"),
            venueName: formData.get("newVenueName"), // Use select only
            organizerName: formData.get("newOrganizerName"), // Use select only
            description: formData.get("newDescription"),
            requiresPayment: formData.get("newRequiresPayment"),
            maxAttendees: formData.get("newMaxAttendees")
        };

        try {
            const response = await fetch("/update-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                throw new Error("Failed to update event");
            }
            const result = await response.json();
            console.log(result);

            alert("Event updated successfully!");
            location.reload();
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Error updating event. Please try again.");
        }
    });
});