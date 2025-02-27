document.getElementById("updateEventForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent form from submitting

    // Get form fields we need to get data from
    let eventToUpdate = document.getElementById("eventID");  // Event ID to update
    let updateEventName = document.getElementById("newEventName");
    let updateEventDate = document.getElementById("newEventDate");
    let updateVenue = document.getElementById("newVenue");
    let updateOrganizer = document.getElementById("newOrganizer");
    let updateDescription = document.getElementById("newDescription");
    let updateMaxAttendees = document.getElementById("newMaxAttendees");

    // Get the values from the form fields
    let eventID = eventToUpdate.value;
    let eventNameValue = updateEventName.value;
    let eventDateValue = updateEventDate.value;
    let venueValue = updateVenue.value;
    let organizerValue = updateOrganizer.value;
    let descriptionValue = updateDescription.value;
    let maxAttendeesValue = updateMaxAttendees.value;

    // Put our data we want to send in a JavaScript object
    let data = {
        eventID: eventID,
        eventName: eventNameValue,
        eventDate: eventDateValue,
        venueName: venueValue,
        organizerName: organizerValue,
        description: descriptionValue,
        maxAttendees: maxAttendeesValue
    }

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/update-event", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // Add the updated event data to the table
            updateRow(xhttp.response, eventID);

            // Clear the input fields for another transaction
            updateEventName.value = '';
            updateEventDate.value = '';
            updateVenue.value = '';
            updateOrganizer.value = '';
            updateDescription.value = '';
            updateMaxAttendees.value = '';

            // Hide the update form
            document.getElementById('update').style.display = 'none';
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.");
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
});

// Function to update row with new event data
function updateRow(data, eventID) {
    let parsedData = JSON.parse(data);

    let table = document.getElementById("eventTable");

    for (let i = 0, row; row = table.rows[i]; i++) {
        // Iterate through rows to find the row matching eventID
        if (table.rows[i].getAttribute("data-value") == eventID) {
            // Get the location of the row where we found the matching eventID
            let updateRowIndex = table.getElementsByTagName("tr")[i];

            // Get td for event name and reassign
            let eventName_td = updateRowIndex.getElementsByTagName("td")[1];
            eventName_td.innerHTML = parsedData[0].eventName;

            // Get td for event date
            let eventDate_td = updateRowIndex.getElementsByTagName("td")[2];
            eventDate_td.innerHTML = parsedData[0].eventDate;

            // Get td for venue
            let venue_td = updateRowIndex.getElementsByTagName("td")[3];
            venue_td.innerHTML = parsedData[0].venueName;

            // Get td for organizer
            let organizer_td = updateRowIndex.getElementsByTagName("td")[4];
            organizer_td.innerHTML = parsedData[0].organizerName;

            // Get td for description
            let description_td = updateRowIndex.getElementsByTagName("td")[5];
            description_td.innerHTML = parsedData[0].description || "NULL";

            // Get td for max attendees
            let maxAttendees_td = updateRowIndex.getElementsByTagName("td")[6];
            maxAttendees_td.innerHTML = parsedData[0].maxAttendees;

            // Update the dropdown option with the new name
            updateDropdownOption(eventID, parsedData[0].eventName);

            break; // We found our row, no need to continue
        }
    }
}

// Function to update dropdown option text when event data changes
function updateDropdownOption(eventID, eventName) {
    let selectEventsMenu = document.getElementById('eventID');
    for (let i = 0; i < selectEventsMenu.options.length; i++) {
        if (selectEventsMenu.options[i].value == eventID) {
            // Update the option text with the new event name
            selectEventsMenu.options[i].text = `${eventID} - ${eventName}`;
            break;
        }
    }
}

// Event listener to auto-update rows with selected event ID
document.getElementById('eventID').addEventListener('change', function() {
    let selectedEventId = this.value;

    // Find the event data in the table
    let table = document.getElementById("eventTable");

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let rowEventId = row.getAttribute("data-value");

        if (rowEventId == selectedEventId) {
            // Populate form fields with existing data
            document.getElementById("newEventName").value = row.cells[1].innerText;
            document.getElementById("newEventDate").value = row.cells[2].innerText;
            document.getElementById("newVenue").value = row.cells[3].innerText;
            document.getElementById("newOrganizer").value = row.cells[4].innerText;
            document.getElementById("newDescription").value = row.cells[5].innerText;
            document.getElementById("newMaxAttendees").value = row.cells[6].innerText;

            break;
        }
    }
});
