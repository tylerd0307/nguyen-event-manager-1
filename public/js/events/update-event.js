document.getElementById("updateEventForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let eventID = document.getElementById("eventID_update").value;
    let eventNameValue = document.getElementById("newEventName").value;
    let eventDateValue = document.getElementById("newEventDate").value;
    let venueValue = document.getElementById("newVenueText").value || document.getElementById("newVenueName").value;
    let organizerValue = document.getElementById("newOrganizerText").value || document.getElementById("newOrganizerName").value;
    let descriptionValue = document.getElementById("newDescription").value;
    let requiresPaymentValue = document.getElementById("newRequiresPayment").value;
    let maxAttendeesValue = document.getElementById("newMaxAttendees").value;

    let data = {
        eventID: eventID,
        eventName: eventNameValue,
        eventDate: eventDateValue,
        venueName: venueValue,
        organizerName: organizerValue,
        description: descriptionValue,
        requiresPayment: requiresPaymentValue,
        maxAttendees: maxAttendeesValue
    };

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/update-event", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log("✅ Update Successful!");
            updateRow(xhttp.responseText, eventID);  // Update the UI with the new event data
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("❌ Error: Unable to update event.");
        }
    };

    xhttp.send(JSON.stringify(data));
});


// Function to update the table with the updated event
function updateRow(data, eventID) {
    let parsedData = JSON.parse(data);
    let table = document.getElementById("eventTable");

    for (let i = 0, row; row = table.rows[i]; i++) {
        if (table.rows[i].getAttribute("data-value") == eventID) {
            let updateRowIndex = table.getElementsByTagName("tr")[i];

            updateRowIndex.cells[1].innerText = parsedData.eventName;
            updateRowIndex.cells[2].innerText = parsedData.eventDate;
            updateRowIndex.cells[3].innerText = parsedData.venueName;
            updateRowIndex.cells[4].innerText = parsedData.organizerName;
            updateRowIndex.cells[5].innerText = parsedData.description || "NULL";
            updateRowIndex.cells[6].innerText = parsedData.requiresPayment ? "Yes" : "No";
            updateRowIndex.cells[7].innerText = parsedData.maxAttendees;

            updateDropdownOption(eventID, parsedData.eventName);
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

            // Convert eventDate to YYYY-MM-DD format before populating input
            let dateValue = new Date(row.cells[2].innerText);
            document.getElementById("newEventDate").value = !isNaN(dateValue.getTime())
                ? dateValue.toISOString().split('T')[0]
                : "";

            document.getElementById("newVenueName").value = row.cells[3].innerText;
            document.getElementById("newOrganizerName").value = row.cells[4].innerText;
            document.getElementById("newDescription").value = row.cells[5].innerText;
            document.getElementById("newRequiresPayment").value = row.cells[6].innerText === "Yes" ? "1" : "0";
            document.getElementById("newMaxAttendees").value = row.cells[7].innerText;

            break;
        }
    }
});
