// Get the objects we need to modify
let addEventForm = document.getElementById('addEventForm');

// Modify the objects we need
addEventForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputEventName = document.getElementById("eventName");
    let inputEventDate = document.getElementById("eventDate");
    let inputVenue = document.getElementById("venue");
    let inputOrganizer = document.getElementById("organizer");
    let inputDescription = document.getElementById("description");
    let inputMaxAttendees = document.getElementById("maxAttendees");

    // Get the values from the form fields
    let eventNameValue = inputEventName.value;
    let eventDateValue = inputEventDate.value;
    let venueValue = inputVenue.value;
    let organizerValue = inputOrganizer.value;
    let descriptionValue = inputDescription.value;
    let maxAttendeesValue = inputMaxAttendees.value;

    // Put our data we want to send in a JavaScript object
    let data = {
        name: eventNameValue,
        date: eventDateValue,
        venue: venueValue,
        organizer: organizerValue,
        description: descriptionValue,
        maxAttendees: maxAttendeesValue
    }

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-event", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            addRowToTable(xhttp.response);

            // Clear the input fields for another transaction
            inputEventName.value = '';
            inputEventDate.value = '';
            inputVenue.value = '';
            inputOrganizer.value = '';
            inputDescription.value = '';
            inputMaxAttendees.value = '';
        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.");
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
})

// Creates a single row from an Object representing a single record from the database
function addRowToTable(data) {

    // Get a reference to the current table on the page
    let currentTable = document.querySelector("#browse table");

    // Parse the response data
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]; // Get the last event in the array

    // Create a row and cells
    let row = document.createElement("TR");
    let deleteButtonContainer = document.createElement("TD");
    let idCell = document.createElement("TD");
    let eventNameCell = document.createElement("TD");
    let eventDateCell = document.createElement("TD");
    let venueCell = document.createElement("TD");
    let organizerCell = document.createElement("TD");
    let descriptionCell = document.createElement("TD");
    let maxAttendeesCell = document.createElement("TD");

    // Fill the cells with correct data
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.setAttribute("onclick", `deleteEvent('${newRow.id}')`);
    
    deleteButtonContainer.appendChild(deleteButton);
    idCell.innerText = newRow.id;
    eventNameCell.innerText = newRow.name;
    eventDateCell.innerText = newRow.date;
    venueCell.innerText = newRow.venue;
    organizerCell.innerText = newRow.organizer;
    descriptionCell.innerText = newRow.description || 'NULL';
    maxAttendeesCell.innerText = newRow.maxAttendees;

    // Add the cells to the row
    row.appendChild(deleteButtonContainer);
    row.appendChild(idCell);
    row.appendChild(eventNameCell);
    row.appendChild(eventDateCell);
    row.appendChild(venueCell);
    row.appendChild(organizerCell);
    row.appendChild(descriptionCell);
    row.appendChild(maxAttendeesCell);

    // Add data attribute
    row.setAttribute("data-value", newRow.id);
    
    // Add the row to the table
    currentTable.appendChild(row);

    // Update any relevant dropdowns (if needed)
    updateEventDropdowns(newRow);
}

// Updates event dropdowns (e.g., for event filtering or editing)
function updateEventDropdowns(newEvent) {
    let eventDropdown = document.getElementById("eventID_update");
    let option = document.createElement("option");
    option.text = newEvent.id + ' - ' + newEvent.name;
    option.value = newEvent.id;
    eventDropdown.appendChild(option);
}
