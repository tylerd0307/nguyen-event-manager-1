// Function to handle deletion from the table link
function deleteVenueFromTable(venueID) {
    if (confirm("Are you sure you want to delete this venue?")) {
        fetch('/delete-venue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ venueID }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert("Venue deleted successfully!");
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error deleting venue:', error);
            alert("Error deleting venue. Please try again.");
        });
    }
}

// Function to handle deletion from the form
document.addEventListener("DOMContentLoaded", function () {
    const deleteVenueForm = document.getElementById("deleteVenueForm");

    if (deleteVenueForm) { // Check if the form exists before adding listener
        deleteVenueForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const venueID = document.getElementById("deleteVenueID").value;

            if (confirm("Are you sure you want to delete this venue?")) {
                try {
                    const response = await fetch("/delete-venue", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ venueID })
                    });

                    if (!response.ok) {
                        throw new Error("Failed to delete venue");
                    }

                    alert("Venue deleted successfully!");
                    window.location.reload();
                } catch (error) {
                    console.error("Error deleting venue:", error);
                    alert("Error deleting venue. Please try again.");
                }
            }
        });
    }
});