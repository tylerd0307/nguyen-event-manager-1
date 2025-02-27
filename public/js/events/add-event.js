let addEventForm = document.getElementById("addEventForm");

addEventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get input values
    let inputEventName = document.getElementById("eventName").value;
    let inputEventDate = document.getElementById("eventDate").value;
    let inputDescription = document.getElementById("description").value;
    let inputRequiresPayment = document.getElementById("requiresPayment").value;
    let inputMaxAttendees = document.getElementById("maxAttendees").value;

    // Venue selection
    let selectedVenue = document.getElementById("venueSelect").value;
    let newVenue = document.getElementById("newVenue").value.trim();

    // Organizer selection
    let selectedOrganizer = document.getElementById("organizerSelect").value;
    let newOrganizer = document.getElementById("newOrganizer").value.trim();

    // Determine which values to send
    let venueToUse = newVenue !== "" ? newVenue : selectedVenue;
    let organizerToUse = newOrganizer !== "" ? newOrganizer : selectedOrganizer;

    if (!venueToUse || !organizerToUse) {
        alert("Please select an existing venue/organizer or enter a new one.");
        return;
    }

    // Prepare data to send
    let data = {
        eventName: inputEventName,
        eventDate: inputEventDate,
        venueName: venueToUse,
        organizerName: organizerToUse,
        description: inputDescription,
        requiresPayment: parseInt(inputRequiresPayment, 10),
        maxAttendees: inputMaxAttendees
    };

    // AJAX request
    fetch("/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(newEvent => {
        console.log("Event Added:", newEvent);
        location.reload(); // Refresh page to update event list
    })
    .catch(error => console.error("Error adding event:", error));
});



// Function to add a new row to the table
function addRowToTable(data) {
    let currentTable = document.querySelector("#browse table");
    let newRow = JSON.parse(data); // Parse the server response

    let row = document.createElement("TR");
    row.setAttribute("data-value", newRow.eventID);

    let idCell = document.createElement("TD");
    let eventNameCell = document.createElement("TD");
    let eventDateCell = document.createElement("TD");
    let venueCell = document.createElement("TD");
    let organizerCell = document.createElement("TD");
    let descriptionCell = document.createElement("TD");
    let requiresPaymentCell = document.createElement("TD");
    let maxAttendeesCell = document.createElement("TD");
    let actionsCell = document.createElement("TD");

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.setAttribute("onclick", `deleteEvent('${newRow.eventID}')`);

    actionsCell.appendChild(deleteButton);
    idCell.innerText = newRow.eventID;
    eventNameCell.innerText = newRow.eventName;
    eventDateCell.innerText = newRow.eventDate;
    venueCell.innerText = newRow.venueName;
    organizerCell.innerText = newRow.organizerName;
    descriptionCell.innerText = newRow.description || "NULL";
    requiresPaymentCell.innerText = newRow.requiresPayment ? "Yes" : "No";
    maxAttendeesCell.innerText = newRow.maxAttendees;

    row.appendChild(idCell);
    row.appendChild(eventNameCell);
    row.appendChild(eventDateCell);
    row.appendChild(venueCell);
    row.appendChild(organizerCell);
    row.appendChild(descriptionCell);
    row.appendChild(requiresPaymentCell);
    row.appendChild(maxAttendeesCell);
    row.appendChild(actionsCell);

    currentTable.appendChild(row);
    updateEventDropdowns(newRow);
}

// Function to update event dropdowns
function updateEventDropdowns(newEvent) {
    let eventDropdown = document.getElementById("eventID_update");
    let option = document.createElement("option");
    option.text = `${newEvent.eventID} - ${newEvent.eventName}`;
    option.value = newEvent.eventID;
    eventDropdown.appendChild(option);
}
