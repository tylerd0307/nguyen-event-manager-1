document.addEventListener("DOMContentLoaded", function () {
    const attendeeIdSelect = document.getElementById("attendeeID");
    const updateAttendeeForm = document.getElementById("updateAttendeeForm");

    attendeeIdSelect.addEventListener("change", async function () {
        const attendeeID = this.value;

        if (attendeeID) {
            try {
                const response = await fetch(`/attendees/${attendeeID}`); // Fetch attendee data
                if (response.ok) {
                    const attendee = await response.json();
                    populateAttendeeForm(attendee); // Pre-populate form
                } else {
                    console.error("Failed to fetch attendee data.");
                }
            } catch (error) {
                console.error("Error fetching attendee data:", error);
            }
        }
    });

    function populateAttendeeForm(attendee) {
        document.getElementById("newAttendeeFirstName").value = attendee.firstName;
        document.getElementById("newAttendeeLastName").value = attendee.lastName;
        document.getElementById("newAttendeeEmail").value = attendee.email;
        document.getElementById("newAttendeePhone").value = attendee.phoneNumber || ""; // Use empty string if phoneNumber is null or undefined
    }

    updateAttendeeForm.addEventListener("submit", async function (event) {
        console.log("Update Attendee Form Submitted");
        event.preventDefault();

        const formData = new FormData(this);
        const attendeeData = {
            attendeeID: formData.get("attendeeID"),
        };

        const newAttendeeFirstName = formData.get("newAttendeeFirstName");
        if (newAttendeeFirstName) attendeeData.newAttendeeFirstName = newAttendeeFirstName;

        const newAttendeeLastName = formData.get("newAttendeeLastName");
        if (newAttendeeLastName) attendeeData.newAttendeeLastName = newAttendeeLastName;

        const newAttendeeEmail = formData.get("newAttendeeEmail");
        if (newAttendeeEmail) attendeeData.newAttendeeEmail = newAttendeeEmail;

        const newAttendeePhone = formData.get("newAttendeePhone");
        if (newAttendeePhone) attendeeData.newAttendeePhone = newAttendeePhone;

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
            location.reload();
        } catch (error) {
            console.error("Error updating attendee:", error);
            alert("Error updating attendee. Please try again.");
        }
    });
});