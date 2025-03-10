document.addEventListener("DOMContentLoaded", function () {
    console.log(window.deleteEventRegistration)
    // Function to handle deletion from the table link
    window.deleteEventRegistration = function (eventID, attendeeID) {
        if (confirm("Are you sure you want to delete this registration?")) {
            fetch('/delete-attendee-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventID, attendeeID }), // Send eventID and attendeeID
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
        }
    };


    // Function to handle deletion from the form
    const deleteRegistrationForm = document.querySelector("#deleteRegistrationForm");

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