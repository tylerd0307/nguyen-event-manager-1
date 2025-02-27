function deleteEvent(eventID) {
    let link = '/delete-event';
    let data = {
        eventID: parseInt(eventID)
    };

    console.log("Sending delete request for event ID:", eventID);

    // Make the AJAX request to delete the event
    $.ajax({
        url: link,
        type: 'POST', // We are using POST here as per your app.js route
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            console.log("Delete successful, removing row from table");
            deleteRow(parseInt(eventID));
        },
        error: function(xhr, status, error) {
            console.error("Error deleting event:", error);
            console.error("Server response:", xhr.responseText);
            alert("Failed to delete event. See console for details.");
        }
    });
}

function deleteRow(eventID) {
    let table = document.getElementById("eventTable");
    for (let i = 0, row; row = table.rows[i]; i++) {
        // Convert both values to numbers to ensure consistent comparison
        if (parseInt(table.rows[i].getAttribute("data-value")) === eventID) {
            table.deleteRow(i);  // Remove the row from the table
            break;
        }
    }

    // Update the dropdown for selecting event ID in the update form
    let selectEventsMenu = document.getElementById("eventID");
    for (let i = 0; i < selectEventsMenu.options.length; i++) {
        if (parseInt(selectEventsMenu.options[i].value) === eventID) {
            // Remove the option from the dropdown
            selectEventsMenu.remove(i);
            break;
        }
    }

    // Update dropdown for filtering by event ID (if applicable)
    let filterEventsMenu = document.getElementById("eventIDDropdown");
    if (filterEventsMenu) {  // Check if the element exists
        for (let i = 0; i < filterEventsMenu.options.length; i++) {
            if (parseInt(filterEventsMenu.options[i].value) === eventID) {
                // Remove the option from the filter dropdown
                filterEventsMenu.remove(i);
                break;
            }
        }
    }
}
