function deleteEvent(eventID) {
    // Confirmation prompt before sending the delete request
    if (!confirm("Are you sure you want to delete this event?")) {
        console.log("Event deletion cancelled.");
        return;
    }

    let link = '/delete-event';
    let data = {
        eventID: parseInt(eventID)
    };

    console.log("Sending delete request for event ID:", eventID);

    // Make the AJAX request to delete the event
    $.ajax({
        url: link,
        type: 'POST',
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
        if (parseInt(table.rows[i].getAttribute("data-value")) === eventID) {
            table.deleteRow(i);
            break;
        }
    }

    // Update the dropdown for selecting event ID in the update form
    let selectEventsMenu = document.getElementById("deleteEventID");
    for (let i = 0; i < selectEventsMenu.options.length; i++) {
        if (parseInt(selectEventsMenu.options[i].value) === eventID) {
            selectEventsMenu.remove(i);
            break;
        }
    }

    // Update dropdown for filtering by event ID (if applicable)
    let filterEventsMenu = document.getElementById("eventIDDropdown");
    if (filterEventsMenu) {
        for (let i = 0; i < filterEventsMenu.options.length; i++) {
            if (parseInt(filterEventsMenu.options[i].value) === eventID) {
                filterEventsMenu.remove(i);
                break;
            }
        }
    }
}

// Event listener for the form submission
document.getElementById("deleteEventForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const eventID = document.getElementById("deleteEventID").value;
    deleteEvent(eventID);
});
