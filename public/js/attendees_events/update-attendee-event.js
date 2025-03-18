document.addEventListener("DOMContentLoaded", function () {
    const eventSelect = document.getElementById('updateEventID');
    const attendeeSelect = document.getElementById('updateAttendeeID');
    const updateRegistrationForm = document.querySelector('#updateRegistrationForm');

    eventSelect.addEventListener('change', fetchAndUpdate);
    attendeeSelect.addEventListener('change', fetchAndUpdate);

    async function fetchAndUpdate() {
        const eventID = eventSelect.value;
        const attendeeID = attendeeSelect.value;

        if (eventID && attendeeID) {
            try {
                const response = await fetch(`/attendees_events/${eventID}/${attendeeID}`); // Fetch registration data
                if (response.ok) {
                    const registration = await response.json();
                    populateRegistrationForm(registration); // Pre-populate form
                } else {
                    console.error("Failed to fetch registration data.");
                }
            } catch (error) {
                console.error("Error fetching registration data:", error);
            }
        }
    }

    function populateRegistrationForm(registration) {
        document.getElementById('updateRegistrationStatus').value = registration.registrationStatus;
    }

    updateRegistrationForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const registrationStatus = document.getElementById('updateRegistrationStatus').value;

        // Get the eventName from the selected option's text content
        const eventName = eventSelect.options[eventSelect.selectedIndex].text;

        // Extract firstName and lastName from the selected attendee's text content
        const attendeeName = attendeeSelect.options[attendeeSelect.selectedIndex].text;
        const [firstName, lastName] = attendeeName.split(' '); // Assumes the format "FirstName LastName"

        const updateData = {
            eventName: eventName,
            firstName: firstName,
            lastName: lastName,
        };

        if (registrationStatus) {
            updateData.registrationStatus = registrationStatus;
        }

        try {
            const response = await fetch('/update-attendee-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                // If update is successful, refresh the page
                window.location.reload();
            } else {
                // Handle error response
                const data = await response.json();
                console.error("Error updating registration:", data.error);
            }
        } catch (error) {
            console.error("Error updating registration:", error);
        }
    });
});