document.addEventListener("DOMContentLoaded", function () {
    const paymentIdSelect = document.getElementById("paymentID");
    const updatePaymentForm = document.getElementById("updatePaymentForm");

    paymentIdSelect.addEventListener("change", async function () {
        const paymentID = this.value;

        if (paymentID) {
            try {
                const response = await fetch(`/payments/${paymentID}`); // Fetch payment data
                if (response.ok) {
                    const payment = await response.json();
                    populatePaymentForm(payment); // Pre-populate form
                } else {
                    console.error("Failed to fetch payment data.");
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
            }
        }
    });

    function populatePaymentForm(payment) {
        document.getElementById("newEventID").value = payment.eventID;
        document.getElementById("newAttendeeID").value = payment.attendeeID;
        document.getElementById("newPaymentDate").value = payment.paymentDate.split('T')[0];
        document.getElementById("newPaymentStatus").value = payment.paymentStatus;
    }

    updatePaymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const paymentData = {
            paymentID: document.getElementById("paymentID").value,
        };

        const newEventID = document.getElementById("newEventID").value;
        if (newEventID) paymentData.newEventID = newEventID;

        const newAttendeeID = document.getElementById("newAttendeeID").value;
        if (newAttendeeID) paymentData.newAttendeeID = newAttendeeID;

        const newPaymentDate = document.getElementById("newPaymentDate").value;
        if (newPaymentDate) paymentData.newPaymentDate = newPaymentDate;

        const newPaymentStatus = document.getElementById("newPaymentStatus").value;
        if (newPaymentStatus) paymentData.newPaymentStatus = newPaymentStatus;

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