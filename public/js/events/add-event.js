document.addEventListener("DOMContentLoaded", function () {
    const addEventForm = document.getElementById("addEventForm");

    addEventForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const inputEventName = document.getElementById("eventName").value;
        const inputEventDate = document.getElementById("eventDate").value;
        const inputDescription = document.getElementById("description").value;
        const inputRequiresPayment = document.getElementById("requiresPayment").value;
        const inputMaxAttendees = document.getElementById("maxAttendees").value;

        const venueName = document.getElementById("venueSelect").value;
        const organizerName = document.getElementById("organizerSelect").value;

        try {
            const response = await fetch("/add-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventName: inputEventName,
                    eventDate: inputEventDate,
                    venueName: venueName,
                    organizerName: organizerName,
                    description: inputDescription,
                    requiresPayment: parseInt(inputRequiresPayment, 10),
                    maxAttendees: inputMaxAttendees
                }),
            });

            if (response.ok) {
                const newEvent = await response.json();
                console.log("Event Added:", newEvent);
                addRowToTable(newEvent);
                addEventForm.reset();
            } else {
                const errorData = await response.json();
                console.error("Error adding event:", errorData.error);
                alert("Error adding event. Please check the console for details.");
            }
        } catch (error) {
            console.error("Error adding event:", error);
            alert("Error adding event. Please try again.");
        }
    });

    function addRowToTable(newEvent) {
        const table = document.getElementById("eventTable");
        const newRow = table.insertRow(-1);
        newRow.setAttribute("data-value", newEvent.eventID);
    
        const cells = [
            newRow.insertCell(),
            newRow.insertCell(),
            newRow.insertCell(),
            newRow.insertCell(),
            newRow.insertCell(),
            newRow.insertCell(),
            newRow.insertCell(),
            newRow.insertCell(),
            newRow.insertCell()
        ];
    
        cells[0].textContent = newEvent.eventID;
        cells[1].textContent = newEvent.eventName;
        cells[2].textContent = newEvent.eventDate;
        cells[3].textContent = newEvent.venueName;
        cells[4].textContent = newEvent.organizerName;
        cells[5].textContent = newEvent.description || "NULL";
        cells[6].textContent = newEvent.requiresPayment ? "Yes" : "No";
        cells[7].textContent = newEvent.maxAttendees;
    
        const deleteLink = document.createElement("a");
        deleteLink.href = "#"; // Set href to '#' or any desired value
        deleteLink.textContent = "Delete";
        deleteLink.setAttribute("onclick", `deleteEvent('${newEvent.eventID}')`);
        cells[8].appendChild(deleteLink);
    
        // Update event dropdowns in other forms
        updateEventDropdowns(newEvent);
    }

    // Function to update event dropdowns
    function updateEventDropdowns(newEvent) {
        const eventDropdowns = [
            document.getElementById("eventID_update"),
            document.getElementById("deleteEventID")
        ];

        eventDropdowns.forEach(dropdown => {
            if (dropdown) { // Check if dropdown exist.
              const option = document.createElement("option");
              option.text = `${newEvent.eventID} - ${newEvent.eventName}`;
              option.value = newEvent.eventID;
              dropdown.appendChild(option);
            }
        });
    }
});