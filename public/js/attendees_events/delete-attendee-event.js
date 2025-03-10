document.addEventListener("DOMContentLoaded", function () {
    // Function to handle deletion from the table link
    window.deleteRegistration = function(eventID, attendeeID) {
        if (confirm("Are you sure you want to delete this registration?")) {
            // Fetch the event and attendee details using their IDs
            Promise.all([
                fetch(`/get-event-details?eventID=${eventID}`).then(res => res.json()),
                fetch(`/get-attendee-details?attendeeID=${attendeeID}`).then(res => res.json())
            ])
            .then(([eventDetails, attendeeDetails]) => {
                const eventName = eventDetails.eventName;
                const firstName = attendeeDetails.firstName;
                const lastName = attendeeDetails.lastName;

                fetch('/delete-attendee-event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ eventName, firstName, lastName }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                    alert("Registration deleted successfully!");
                    window.location.reload();
                })
                .catch((error) => {
                    console.error('Error deleting registration:', error);
                    alert("Error deleting registration. Please try again.");
                });
            })
            .catch(error => {
                console.error("Error fetching event or attendee details:", error);
                alert("Error deleting registration. Please try again.");
            });
        }
    };

    // Function to handle deletion from the form
    const deleteRegistrationForm = document.getElementById("deleteRegistrationForm");

    if (deleteRegistrationForm) { // Check if the form exists before adding listener
        deleteRegistrationForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const eventSelect = document.getElementById('deleteEventID');
            const attendeeSelect = document.getElementById('deleteAttendeeID');

            const eventID = eventSelect.value;
            const attendeeID = attendeeSelect.value;

            if (confirm("Are you sure you want to delete this registration?")) {
                try {
                    const response = await fetch("/delete-attendee-event", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ eventID, attendeeID })
                    });

                    if (!response.ok) {
                        throw new Error("Failed to delete registration");
                    }

                    alert("Registration deleted successfully!");
                    window.location.reload();
                } catch (error) {
                    console.error("Error deleting registration:", error);
                    alert("Error deleting registration. Please try again.");
                }
            }
        });
    }
});