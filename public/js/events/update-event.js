document.getElementById("updateEventForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload

    // Get form fields
    let eventToUpdate = document.getElementById("eventID_update"); // Corrected id here
    if (!eventToUpdate) {
        console.error("Event ID dropdown not found");
        return;
    }

    let eventID = eventToUpdate.value; // Get the value from the dropdown
    if (!eventID) {
        console.error("No event ID selected");
        return;
    }

    // Now get the rest of the fields
    let updateEventName = document.getElementById("newEventName");
    let updateEventDate = document.getElementById("newEventDate");
    let updateVenue = document.getElementById("newVenueName");
    let updateOrganizer = document.getElementById("newOrganizerName");
    let updateDescription = document.getElementById("newDescription");
    let updateMaxAttendees = document.getElementById("newMaxAttendees");

    // Get the values from the form fields
    let eventNameValue = updateEventName.value;
    let eventDateValue = updateEventDate.value;
    let venueValue = updateVenue.value;
    let organizerValue = updateOrganizer.value;
    let descriptionValue = updateDescription.value;
    let maxAttendeesValue = updateMaxAttendees.value;

    // Put data into a JavaScript object
    let data = {
        eventID: eventID,
        eventName: eventNameValue,
        eventDate: eventDateValue,
        venueName: venueValue,
        organizerName: organizerValue,
        description: descriptionValue,
        maxAttendees: maxAttendeesValue
    };

    // Setup the AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/update-event", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // Handle success - Update the row in the table
            updateRow(xhttp.response, eventID);

            // Clear form fields
            updateEventName.value = '';
            updateEventDate.value = '';
            updateVenue.value = '';
            updateOrganizer.value = '';
            updateDescription.value = '';
            updateMaxAttendees.value = '';

            // Optionally hide the form
            document.getElementById('update').style.display = 'none';
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("Error: Unable to update event.");
        }
    };

    // Send the request
    xhttp.send(JSON.stringify(data));
});

// Function to update the table with the updated event
function updateRow(data, eventID) {
    let parsedData = JSON.parse(data);
    let table = document.getElementById("eventTable");

    for (let i = 0, row; row = table.rows[i]; i++) {
        if (table.rows[i].getAttribute("data-value") == eventID) {
            let updateRowIndex = table.getElementsByTagName("tr")[i];

            let eventName_td = updateRowIndex.getElementsByTagName("td")[1];
            eventName_td.innerHTML = parsedData[0].eventName;

            let eventDate_td = updateRowIndex.getElementsByTagName("td")[2];
            eventDate_td.innerHTML = parsedData[0].eventDate;

            let venue_td = updateRowIndex.getElementsByTagName("td")[3];
            venue_td.innerHTML = parsedData[0].venueName;

            let organizer_td = updateRowIndex.getElementsByTagName("td")[4];
            organizer_td.innerHTML = parsedData[0].organizerName;

            let description_td = updateRowIndex.getElementsByTagName("td")[5];
            description_td.innerHTML = parsedData[0].description || "NULL";

            let maxAttendees_td = updateRowIndex.getElementsByTagName("td")[6];
            maxAttendees_td.innerHTML = parsedData[0].maxAttendees;

            updateDropdownOption(eventID, parsedData[0].eventName);
            break;
        }
    }
}

// Update the dropdown option text after an update
function updateDropdownOption(eventID, eventName) {
    let selectEventsMenu = document.getElementById('eventID_update');
    for (let i = 0; i < selectEventsMenu.options.length; i++) {
        if (selectEventsMenu.options[i].value == eventID) {
            selectEventsMenu.options[i].text = `${eventID} - ${eventName}`;
            break;
        }
    }
}

// Event listener for auto-filling the form when an event is selected
document.getElementById('eventID_update').addEventListener('change', function () {
    let selectedEventId = this.value;
    let table = document.getElementById("eventTable");

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let rowEventId = row.getAttribute("data-value");

        if (rowEventId == selectedEventId) {
            document.getElementById("newEventName").value = row.cells[1].innerText;
            document.getElementById("newEventDate").value = row.cells[2].innerText;
            document.getElementById("newVenueName").value = row.cells[3].innerText;
            document.getElementById("newOrganizerName").value = row.cells[4].innerText;
            document.getElementById("newDescription").value = row.cells[5].innerText;
            document.getElementById("newMaxAttendees").value = row.cells[6].innerText;
            break;
        }
    }
});
