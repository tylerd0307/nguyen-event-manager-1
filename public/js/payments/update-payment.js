document.addEventListener("DOMContentLoaded", function () {
    const updatePaymentForm = document.getElementById("updatePaymentForm");

    updatePaymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const paymentData = {
            paymentID: document.getElementById("paymentID").value,
            newEventID: document.getElementById("newEventID").value, // Get value from newEventID dropdown
            newAttendeeID: document.getElementById("newAttendeeID").value, // Get value from newAttendeeID dropdown
            newPaymentDate: document.getElementById("newPaymentDate").value,
            newPaymentStatus: document.getElementById("newPaymentStatus").value
        };

        console.log("Sending updated payment data:", paymentData);

        try {
            const response = await fetch("/update-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error("Failed to update payment");
            }

            alert("Payment updated successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error updating payment:", error);
            alert("Error updating payment. Please try again.");
        }
    });
});