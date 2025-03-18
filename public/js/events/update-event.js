document.addEventListener("DOMContentLoaded", function () {
    const eventIdSelect = document.getElementById("updateEventID");
    const updateEventForm = document.getElementById("updateEventForm");

    eventIdSelect.addEventListener("change", async function () {
        const eventID = this.value;

        if (eventID) {
            try {
                const response = await fetch(`/events/${eventID}`); // Fetch event data
                if (response.ok) {
                    const event = await response.json();
                    populateEventForm(event); // Pre-populate form
                } else {
                    console.error("Failed to fetch event data.");
                }
            } catch (error) {
                console.error("Error fetching event data:", error);
            }
        }
    });

    function populateEventForm(event) {
        document.getElementById("newEventName").value = event.eventName;
        document.getElementById("newEventDate").value = event.eventDate.split('T')[0]; // Format date
        document.getElementById("newVenueName").value = event.venueName;
        document.getElementById("newOrganizerName").value = event.organizerName;
        document.getElementById("newDescription").value = event.description;
        document.getElementById("newRequiresPayment").value = event.requiresPayment;
        document.getElementById("newMaxAttendees").value = event.maxAttendees;
    }

    updateEventForm.addEventListener("submit", async function (event) {
        console.log("Update Event Form Submitted");
        event.preventDefault();

        const formData = new FormData(this);
        const eventData = {
            eventID: formData.get("updateEventID"),
        };

        // Collect only fields with values
        const eventName = formData.get("newEventName");
        if (eventName) eventData.eventName = eventName;

        const eventDate = formData.get("newEventDate");
        if (eventDate) eventData.eventDate = eventDate;

        const venueName = formData.get("newVenueName");
        if (venueName) eventData.venueName = venueName;

        const organizerName = formData.get("newOrganizerName");
        if (organizerName) eventData.organizerName = organizerName;

        const description = formData.get("newDescription");
        if (description) eventData.description = description;

        const requiresPayment = formData.get("newRequiresPayment");
        if (requiresPayment) eventData.requiresPayment = requiresPayment;

        const maxAttendees = formData.get("newMaxAttendees");
        if (maxAttendees) eventData.maxAttendees = maxAttendees;

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