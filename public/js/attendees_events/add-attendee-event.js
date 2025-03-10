document.addEventListener("DOMContentLoaded", function () {
    const addRegistrationForm = document.querySelector('#addRegistrationForm');

    addRegistrationForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const eventSelect = document.getElementById('addEventID');
        const attendeeSelect = document.getElementById('addAttendeeID');
        const registrationStatus = document.getElementById('addRegistrationStatus').value;

        // Get the eventName from the selected option's text content
        const eventName = eventSelect.options[eventSelect.selectedIndex].text;

        // Extract firstName and lastName from the selected attendee's text content
        const attendeeName = attendeeSelect.options[attendeeSelect.selectedIndex].text;
        const [firstName, lastName] = attendeeName.split(' '); // Assumes the format "FirstName LastName"

        try {
            const response = await fetch('/add-attendee-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventName, firstName, lastName, registrationStatus }),
            });

            if (response.ok) {
                // If registration is successful, refresh the page
                window.location.reload(); 
            } else {
                // Handle error response
                const data = await response.json();
                console.error("Error adding registration:", data.error);
            }
        } catch (error) {
            console.error("Error adding registration:", error);
        }
    });

});