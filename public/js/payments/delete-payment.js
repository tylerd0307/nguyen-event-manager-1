
document.addEventListener("DOMContentLoaded", function () {
    // Function to handle deletion from the table link
    window.deletePayment = function (paymentID) {
        if (confirm("Are you sure you want to delete this payment?")) {
            fetch('/delete-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentID }), 
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                    alert("Payment deleted successfully!");
                    window.location.reload();
                })
                .catch((error) => {
                    console.error('Error deleting payment:', error);
                    alert("Error deleting payment. Please try again.");
                });
        }
    };
    const deletePaymentForm = document.getElementById("deletePaymentForm");

    deletePaymentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const paymentID = document.querySelector('select[name="deletePaymentID"]').value;

        const confirmation = confirm("Are you sure you want to delete this payment?");
        if (!confirmation) {
            return; // If not confirmed, don't proceed with deletion
        }

        try {
            const response = await fetch("/delete-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ paymentID })
            });

            if (!response.ok) {
                throw new Error("Failed to delete payment");
            }

            alert("Payment deleted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting payment:", error);
            alert("Error deleting payment. Please try again.");
        }
    });
});