document.getElementById("updateEventForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload

    // Get form fields
    let eventToUpdate = document.getElementById("eventID_update"); 
    if (!eventToUpdate) {
        console.error("Event ID dropdown not found");
        return;
    }

    let eventID = eventToUpdate.value; 
    if (!eventID) {
        console.error("No event ID selected");
        return;
    }

    // Get updated values from form fields
    let updateVenue = document.getElementById("newVenueName").value;
    let updateOrganizer = document.getElementById("newOrganizerName").value;
    let updateDescription = document.getElementById("newDescription").value;
    let updateRequiresPayment = document.getElementById("newRequiresPayment").value;
    let updateMaxAttendees = document.getElementById("newMaxAttendees").value;

    // Prepare data object
    let data = {
        eventID: eventID,
        venueName: updateVenue,
        organizerName: updateOrganizer,
        description: updateDescription,
        requiresPayment: updateRequiresPayment,
        maxAttendees: updateMaxAttendees
    };

    // Setup AJAX request
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/update-event", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let responseData = JSON.parse(xhttp.responseText);
            updateRow(responseData, eventID);

            // Clear form fields
            document.getElementById("updateEventForm").reset();

            // Optionally hide the form
            document.getElementById('update').style.display = 'none';
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.error("Error: Unable to update event. Server response:", xhttp.responseText);
        }
    };

    // Send the request
    xhttp.send(JSON.stringify(data));
});

// Function to update the event table row dynamically
function updateRow(updatedData, eventID) {
    let table = document.getElementById("eventTable");

    for (let i = 1, row; row = table.rows[i]; i++) { // Start from 1 to skip header
        if (parseInt(row.getAttribute("data-value")) === parseInt(eventID)) {
            row.cells[3].innerText = updatedData.venueName; 
            row.cells[4].innerText = updatedData.organizerName;
            row.cells[5].innerText = updatedData.description || "NULL";
            row.cells[6].innerText = updatedData.requiresPayment == "1" ? "Yes" : "No";
            row.cells[7].innerText = updatedData.maxAttendees;
            break;
        }
    }
}
