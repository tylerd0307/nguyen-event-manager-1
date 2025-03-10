document.addEventListener("DOMContentLoaded", function () {
    const addPaymentForm = document.getElementById("addPaymentForm");

    addPaymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const paymentData = {
            eventID: document.getElementById("eventID").value, // Get value from eventID dropdown
            attendeeID: document.getElementById("attendeeID").value, // Get value from attendeeID dropdown
            paymentDate: document.getElementById("paymentDate").value,
            paymentStatus: document.getElementById("paymentStatus").value
        };

        console.log("Sending payment data:", paymentData);

        try {
            const response = await fetch("/add-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error("Failed to add payment");
            }

            alert("Payment added successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error adding payment:", error);
            alert("Error adding payment. Please try again.");
        }
    });
});