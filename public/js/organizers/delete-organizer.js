document.addEventListener("DOMContentLoaded", function () {
    window.deleteOrganizer = async function (organizerID) {
        const confirmation = confirm("Are you sure you want to delete this organizer?");
        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch("/delete-organizer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ organizerID })
            });

            if (!response.ok) {
                throw new Error("Failed to delete organizer");
            }

            alert("Organizer deleted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting organizer:", error);
            alert("Error deleting organizer. Please try again.");
        }
    };
});