document.addEventListener("DOMContentLoaded", function () {
    const updateRegistrationForm = document.querySelector('#updateRegistrationForm');

    updateRegistrationForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const eventSelect = document.getElementById('updateEventID');
        const attendeeSelect = document.getElementById('updateAttendeeID');
        const registrationStatus = document.getElementById('updateRegistrationStatus').value;

        // Get the eventName from the selected option's text content
        const eventName = eventSelect.options[eventSelect.selectedIndex].text;

        // Extract firstName and lastName from the selected attendee's text content
        const attendeeName = attendeeSelect.options[attendeeSelect.selectedIndex].text;
        const [firstName, lastName] = attendeeName.split(' '); // Assumes the format "FirstName LastName"

        try {
            const response = await fetch('/update-attendee-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventName, firstName, lastName, registrationStatus }),
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