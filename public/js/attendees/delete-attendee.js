document.addEventListener("DOMContentLoaded", function () {
    // Function to handle deletion of an attendee
    window.deleteAttendee = async function (attendeeID) {
        console.log(`Delete Attendee Request for ID: ${attendeeID}`);
        
        const confirmation = confirm("Are you sure you want to delete this attendee?");
        if (!confirmation) {
            return; // If not confirmed, don't proceed with deletion
        }

        try {
            // Sending a POST request to delete the attendee
            const response = await fetch(`/delete-attendee`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attendeeID })
            });

            if (!response.ok) {
                throw new Error("Failed to delete attendee");
            }
            
            // Parse the response
            const result = await response.json();
            console.log(result);

            // Show the success message
            alert(result.success);

            // Remove the row from the table without reloading the page
            const row = document.getElementById(`attendee-row-${attendeeID}`);
            if (row) {
                row.remove();
            }

        } catch (error) {
            console.error("Error deleting attendee:", error);
            alert("Error deleting attendee. Please try again.");
        }
    };
});
