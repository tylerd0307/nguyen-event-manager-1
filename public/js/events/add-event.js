let addEventForm = document.getElementById("addEventForm");

// Listen for form submission
addEventForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page reload

    // Get input values
    let inputEventName = document.getElementById("eventName").value;
    let inputEventDate = document.getElementById("eventDate").value;
    let inputVenue = document.getElementById("venueName").value;
    let inputOrganizer = document.getElementById("organizerName").value;
    let inputDescription = document.getElementById("description").value;
    let inputRequiresPayment = document.getElementById("requiresPayment").value;
    let inputMaxAttendees = document.getElementById("maxAttendees").value;

    // Convert `requiresPayment` to an actual number (0 or 1)
    let requiresPaymentValue = parseInt(inputRequiresPayment, 10); 

    // Create an object to send to the backend
    let data = {
        eventName: inputEventName,
        eventDate: inputEventDate,
        venueName: inputVenue,
        organizerName: inputOrganizer,
        description: inputDescription,
        requiresPayment: requiresPaymentValue,  // ✅ Ensure it's a number
        maxAttendees: inputMaxAttendees
    };

    // AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-event", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            console.log("Server Response:", xhttp.responseText); // Log response
    
            if (xhttp.status == 200) {
                try {
                    addRowToTable(xhttp.responseText);
                    addEventForm.reset(); // Clear form
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    console.error("Raw server response:", xhttp.responseText);
                }
            } else {
                console.error("Failed to add event.");
            }
        }
    };
    

    // Send data
    xhttp.send(JSON.stringify(data));
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
