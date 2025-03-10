// app.js
// Setup
var db = require('./db-connector');
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 9017;

// Import Moment.js
const moment = require('moment');

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

// Handlebars Setup
var exphbs = require('express-handlebars');
app.engine("handlebars", exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    helpers: {
        formatDate: function (date, format) {
            return moment(date).format(format);
        }
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Index Page
app.get('/', (req, res) => {
    res.status(200).render("index", { title: "Home" }); 
});

// Events Page - Display all events
app.get('/events', async (req, res) => {
    try {
        const [eventRows] = await db.tylerPool.query(`
            SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, e.description, e.requiresPayment, e.maxAttendees
            FROM Events e
            JOIN Venues v ON e.venueID = v.venueID
            JOIN Organizers o ON e.organizerID = o.organizerID;
        `);

        const [venueRows] = await db.tylerPool.query(`SELECT venueID, venueName FROM Venues;`);
        const [organizerRows] = await db.tylerPool.query(`SELECT organizerID, organizerName FROM Organizers;`);

        res.status(200).render("events", {
            data: eventRows,
            venues: venueRows,
            organizers: organizerRows
        });
    } catch (error) {
        console.error("Events Page Error:", error);
        res.sendStatus(500);
    }
});

// Add Event - Handle POST request to add a new event
app.post('/add-event', async (req, res) => {
    const data = req.body;

    try {
        console.log("Venue Name:", data.venueName);

        // Get venue ID
        const [venueRows] = await db.tylerPool.query("SELECT venueID FROM Venues WHERE venueName = ?", [data.venueName]);

        console.log("Venue Query Result:", venueRows);

        if (!venueRows || venueRows.length === 0) {
            return res.status(400).json({ error: "Venue not found." });
        }

        const venueID = venueRows[0].venueID;

        // Get organizer ID
        const [organizerRows] = await db.tylerPool.query("SELECT organizerID FROM Organizers WHERE organizerName = ?", [data.organizerName]);

        if (!organizerRows || organizerRows.length === 0) {
            return res.status(400).json({ error: "Organizer not found." });
        }

        const organizerID = organizerRows[0].organizerID;

        // Insert the event
        const [insertResult] = await db.tylerPool.query("INSERT INTO Events SET ?", {
            eventName: data.eventName,
            eventDate: data.eventDate,
            venueID: venueID,
            organizerID: organizerID,
            description: data.description,
            requiresPayment: data.requiresPayment,
            maxAttendees: data.maxAttendees
        });

        res.json({
            eventID: insertResult.insertId,
            eventName: data.eventName,
            eventDate: data.eventDate,
            venueName: data.venueName,
            organizerName: data.organizerName,
            description: data.description,
            requiresPayment: data.requiresPayment,
            maxAttendees: data.maxAttendees
        });
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({ error: "Failed to add event." });
    }
});

// Update Event - Handle POST request to update an event
app.post('/update-event', async (req, res) => {
    console.log("📌 POST request received for /update-event");
    console.log("📌 Received Data:", req.body);

    const data = req.body;

    if (!data.eventID || !data.eventName || !data.eventDate) {
        console.error("❌ Missing required fields!");
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        // Step 1: Check if venue exists, insert if not
        await db.tylerPool.query(`
            INSERT INTO Venues (venueName, address, capacity)
            SELECT ?, 'Unknown Address', 100
            WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE venueName = ?) 
            LIMIT 1;
        `, [data.venueName, data.venueName]);

        // Get venue ID
        const [venueRows] = await db.tylerPool.query("SELECT venueID FROM Venues WHERE venueName = ?", [data.venueName]);
        if (!venueRows || venueRows.length === 0) {
            console.error("❌ Venue Lookup Error");
            return res.status(400).json({ error: "Failed to get venue ID." });
        }
        const venueID = venueRows[0].venueID;

        // Step 2: Check if organizer exists, insert if not
        await db.tylerPool.query(`
            INSERT INTO Organizers (organizerName, email)
            SELECT ?, 'unknown@example.com'
            WHERE NOT EXISTS (SELECT 1 FROM Organizers WHERE organizerName = ?) 
            LIMIT 1;
        `, [data.organizerName, data.organizerName]);

        // Get organizer ID
        const [organizerRows] = await db.tylerPool.query("SELECT organizerID FROM Organizers WHERE organizerName = ?", [data.organizerName]);
        if (!organizerRows || organizerRows.length === 0) {
            return res.status(400).json({ error: "Failed to get organizer ID." });
        }
        const organizerID = organizerRows[0].organizerID;

        // Step 3: Update the event
        await db.tylerPool.query(`
            UPDATE Events 
            SET eventName = ?, eventDate = ?, 
                venueID = ?, organizerID = ?, 
                description = ?, requiresPayment = ?, maxAttendees = ? 
            WHERE eventID = ?;
        `, [data.eventName, data.eventDate, venueID, organizerID, data.description, data.requiresPayment, data.maxAttendees, data.eventID]);

        console.log("✅ Event successfully updated!");

        // Step 4: Retrieve updated event and return it
        const [selectResult] = await db.tylerPool.query(`
            SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, 
                   e.description, e.requiresPayment, e.maxAttendees
            FROM Events e
            JOIN Venues v ON e.venueID = v.venueID
            JOIN Organizers o ON e.organizerID = o.organizerID
            WHERE e.eventID = ?;
        `, [data.eventID]);

        if (!selectResult || selectResult.length === 0) {
            return res.status(400).json({ error: "Failed to fetch updated event." });
        }

        res.json({ updatedEvent: selectResult[0] });
    } catch (error) {
        console.error("❌ Update Error:", error);
        return res.status(400).json({ error: "Failed to update event." });
    }
});

// Delete Event - Handle DELETE request to delete an event
app.post('/delete-event', async (req, res) => {
    console.log("📌 POST request received for /delete-event");
    console.log("📌 Received Data:", req.body);

    const eventID = req.body.eventID;

    if (!eventID) {
        return res.status(400).json({ error: "Missing eventID." });
    }

    try {
        await db.tylerPool.query("DELETE FROM Attendees_Events WHERE eventID = ?", [eventID]);
        await db.tylerPool.query("DELETE FROM Payments WHERE eventID = ?", [eventID]);
        await db.tylerPool.query("DELETE FROM Events WHERE eventID = ?", [eventID]);

        console.log("✅ Event successfully deleted!");
        res.json({ success: "Event deleted successfully!" });
    } catch (error) {
        console.error("❌ Delete Error:", error);
        return res.status(500).json({ error: "Failed to delete event." });
    }
});

// GET /attendees - Display all attendees
app.get('/attendees', async (req, res) => {
    try {
        const [attendeeRows] = await db.tylerPool.query(`SELECT attendeeID, firstName, lastName, email, phoneNumber FROM Attendees;`);

        res.status(200).render("attendees", {
            data: attendeeRows,
        });
    } catch (error) {
        console.error("Attendee Query Error:", error);
        res.sendStatus(500);
    }
});

// POST /add-attendee - Add a new attendee
app.post('/add-attendee', async (req, res) => {
    const data = req.body;
    console.log("Received data:", req.body);

    // Validate that required fields are present
    if (!data.firstName || !data.lastName || !data.email) {
        return res.status(400).json({ error: "Missing required fields (firstName, lastName, email)." });
    }

    try {
        const [result] = await db.tylerPool.query(`
            INSERT INTO Attendees (firstName, lastName, email, phoneNumber) 
            VALUES (?, ?, ?, ?);
        `, [data.firstName, data.lastName, data.email, data.phone]);

        console.log("✅ Attendee added successfully!");
        res.status(200).json({ success: "Attendee added successfully!", attendeeID: result.insertId });
    } catch (error) {
        console.error("❌ Error adding attendee:", error);
        return res.status(500).json({ error: "Failed to add attendee." });
    }
});

// POST /update-attendee - Update an attendee
app.post('/update-event', async (req, res) => {
    console.log("📌 POST request received for /update-event");
    console.log("📌 Received Data:", req.body);

    const data = req.body;

    if (!data.eventID || !data.eventName || !data.eventDate || !data.venueName || !data.organizerName) {
        console.error("❌ Missing required fields!");
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        // Step 1: Get venueID and organizerID
        const [venueRows] = await db.tylerPool.query("SELECT venueID FROM Venues WHERE venueName = ?", [data.venueName]);
        const [organizerRows] = await db.tylerPool.query("SELECT organizerID FROM Organizers WHERE organizerName = ?", [data.organizerName]);

        if (venueRows.length === 0 || organizerRows.length === 0) {
            console.error("❌ Venue or Organizer not found!");
            return res.status(404).json({ error: "Venue or Organizer not found." });
        }

        const venueID = venueRows[0].venueID;
        const organizerID = organizerRows[0].organizerID;

        // Step 2: Update the event
        await db.tylerPool.query(
            `
            UPDATE Events
            SET eventName = ?,
                eventDate = ?,
                venueID = ?,
                organizerID = ?,
                description = ?,
                requiresPayment = ?,
                maxAttendees = ?
            WHERE eventID = ?
            `,
            [
                data.eventName,
                data.eventDate,
                venueID,
                organizerID,
                data.description,
                data.requiresPayment,
                data.maxAttendees,
                data.eventID,
            ]
        );

        console.log("✅ Event updated successfully!");
        res.json({ success: "Event updated successfully!" });
    } catch (error) {
        console.error("❌ Update Event Error:", error);
        return res.status(500).json({ error: "Failed to update event." });
    }
});

// POST /delete-attendee - Delete an attendee
app.post('/delete-attendee', async (req, res) => {
    console.log("📌 POST request received for /delete-attendee");
    console.log("📌 Received Data:", req.body);

    const attendeeID = req.body.attendeeID;

    if (!attendeeID) {
        return res.status(400).json({ error: "Missing attendeeID." });
    }

    try {
        await db.tylerPool.query(`
            DELETE FROM Attendees WHERE attendeeID = ?;
        `, [attendeeID]);

        console.log("✅ Attendee deleted successfully!");
        res.json({ success: "Attendee deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting attendee:", error);
        return res.status(500).json({ error: "Failed to delete attendee." });
    }
});

// GET /organizers - Display all organizers
app.get('/organizers', async (req, res) => {
    try {
        const [organizerRows] = await db.tylerPool.query(`SELECT * FROM Organizers`);
        res.status(200).render("organizers", { data: organizerRows });
    } catch (error) {
        console.error("Organizer Query Error:", error);
        res.sendStatus(500);
    }
});

// POST /add-organizer - Add a new organizer
app.post("/add-organizer", async (req, res) => {
    const { organizerName, email, phone } = req.body;
    if (!organizerName || !email) {
        return res.status(400).json({ error: "Organizer Name and Email are required" });
    }
    try {
        const [result] = await db.tylerPool.query(
            "INSERT INTO Organizers (organizerName, email, phoneNumber) VALUES (?, ?, ?)",
            [organizerName, email, phone]
        );
        res.status(201).json({ message: "Organizer added successfully", id: result.insertId });
    } catch (error) {
        console.error("Error adding organizer: ", error);
        res.status(500).json({ error: "Database error" });
    }
});

// POST /update-organizer - Update an organizer
app.post("/update-organizer", async (req, res) => {
    const { organizerID, newOrganizerName, newOrganizerEmail, newOrganizerPhone } = req.body;
    if (!organizerID || !newOrganizerName || !newOrganizerEmail) {
        return res.status(400).json({ error: "Missing required fields (organizerID, newOrganizerName, newOrganizerEmail)." });
    }
    try {
        const [result] = await db.tylerPool.query(
            `UPDATE Organizers SET organizerName = ?, email = ?, phoneNumber = ? WHERE organizerID = ?;`,
            [newOrganizerName, newOrganizerEmail, newOrganizerPhone, organizerID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Organizer not found." });
        }
        console.log("Organizer updated successfully");
        res.json({ success: "Organizer updated successfully" });
    } catch (error) {
        console.error("Error updating organizer:", error);
        res.status(500).json({ error: "Failed to update organizer." });
    }
});

// POST /delete-organizer - Delete an organizer
app.post("/delete-organizer", async (req, res) => {
    const { organizerID } = req.body;
    if (!organizerID) {
        return res.status(400).json({ error: "Missing organizerID." });
    }
    try {
        await db.tylerPool.query(`DELETE FROM Organizers WHERE organizerID = ?;`, [organizerID]);
        res.json({ message: "Organizer deleted successfully" });
    } catch (error) {
        console.error("Error deleting organizer: ", error);
        res.status(500).json({ error: "Database error" });
    }
});

// GET /payments - Display all payments
app.get('/payments', async (req, res) => {
    try {
        const [paymentResults] = await db.tylerPool.query(`
            SELECT p.paymentID, e.eventName, a.firstName, a.lastName, p.paymentDate, p.paymentStatus
            FROM Payments p
            LEFT JOIN Events e ON p.eventID = e.eventID
            JOIN Attendees a ON p.attendeeID = a.attendeeID
        `);
        const [eventResults] = await db.tylerPool.query(`SELECT eventID, eventName FROM Events`);
        const [attendeeResults] = await db.tylerPool.query(`SELECT attendeeID, firstName, lastName FROM Attendees`);

        res.render('payments', {
            data: paymentResults,
            events: eventResults,
            attendees: attendeeResults
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ error: "Database error while retrieving payments" });
    }
});

// POST /add-payment - Add a new payment
app.post("/add-payment", async (req, res) => {
    const { eventID, attendeeID, paymentDate, paymentStatus } = req.body;
    console.log("Received add-payment request:", req.body);
    if (!eventID || !attendeeID || !paymentDate || !paymentStatus) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const [result] = await db.tylerPool.query(`
            INSERT INTO Payments (eventID, attendeeID, paymentDate, paymentStatus) 
            VALUES (?, ?, ?, ?);
        `, [eventID, attendeeID, paymentDate, paymentStatus]);
        res.status(201).json({ message: "Payment added successfully", id: result.insertId });
    } catch (error) {
        console.error("Error adding payment:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// POST /update-payment - Update a payment
app.post("/update-payment", async (req, res) => {
    const { paymentID, newEventID, newAttendeeID, newPaymentDate, newPaymentStatus } = req.body;

    if (!paymentID || !newEventID || !newAttendeeID || !newPaymentDate || !newPaymentStatus) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const [result] = await db.tylerPool.query(`
            UPDATE Payments 
            SET eventID = ?, 
                attendeeID = ?, 
                paymentDate = ?, 
                paymentStatus = ? 
            WHERE paymentID = ?;
        `, [newEventID, newAttendeeID, newPaymentDate, newPaymentStatus, paymentID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Payment not found." });
        }

        console.log("Payment updated successfully");
        res.json({ success: "Payment updated successfully" });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: "Failed to update payment." });
    }
});

// POST /delete-payment - Delete a payment
app.post("/delete-payment", async (req, res) => {
    const { paymentID } = req.body;

    if (!paymentID) {
        return res.status(400).json({ error: "Missing paymentID." });
    }

    try {
        const [result] = await db.tylerPool.query(`
            DELETE FROM Payments 
            WHERE paymentID = ?;
        `, [paymentID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Payment not found." });
        }

        console.log("Payment deleted successfully");
        res.json({ success: "Payment deleted successfully" });
    } catch (error) {
        console.error("Error deleting payment:", error);
        res.status(500).json({ error: "Failed to delete payment." });
    }
});

// GET /venues - Display all venues
app.get('/venues', async (req, res) => {
    try {
        const [venueRows] = await db.tylerPool.query(`SELECT * FROM Venues`);

        res.status(200).render("venues", {
            data: venueRows
        });
    } catch (error) {
        console.error("Venue Query Error:", error);
        res.sendStatus(500);
    }
});

// POST /add-venue - Add a new venue
app.post("/add-venue", async (req, res) => {
    const { venueName, address, capacity, contactNumber } = req.body;
    if (!venueName || !address || !capacity || !contactNumber) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const [result] = await db.tylerPool.query(
            "INSERT INTO Venues (venueName, address, capacity, contactNumber) VALUES (?, ?, ?, ?)",
            [venueName, address, capacity, contactNumber]
        );
        res.status(201).json({ message: "Venue added successfully", id: result.insertId });
    } catch (error) {
        console.error("Error adding venue: ", error);
        res.status(500).json({ error: "Database error" });
    }
});

// POST /update-venue - Update a venue
app.post("/update-venue", async (req, res) => {
    const { venueID, venueName, address, capacity, contactNumber } = req.body;
    console.log("Received update-venue request:", req.body);

    if (!venueID || !venueName || !address || !capacity || !contactNumber) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const [result] = await db.tylerPool.query(
            `UPDATE Venues SET venueName = ?, address = ?, capacity = ?, contactNumber = ? WHERE venueID = ?;`,
            [venueName, address, capacity, contactNumber, venueID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Venue not found." });
        }

        console.log("Venue updated successfully");
        res.json({ success: "Venue updated successfully" });
    } catch (error) {
        console.error("Error updating venue:", error);
        res.status(500).json({ error: "Failed to update venue." });
    }
});

// POST /delete-venue - Delete a venue
app.post("/delete-venue", async (req, res) => {
    const { venueID } = req.body;

    if (!venueID) {
        return res.status(400).json({ error: "Missing venueID." });
    }

    try {
        const [result] = await db.tylerPool.query(
            `DELETE FROM Venues WHERE venueID = ?;`,
            [venueID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Venue not found." });
        }

        console.log("Venue deleted successfully");
        res.json({ success: "Venue deleted successfully" });
    } catch (error) {
        console.error("Error deleting venue:", error);
        res.status(500).json({ error: "Failed to delete venue." });
    }
});

// GET /attendees_events - Display all attendee-event registrations
app.get('/attendees_events', async (req, res) => {
    // Disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const [registrationResults] = await db.tylerPool.query(`
            SELECT e.eventID, e.eventName, a.attendeeID, a.firstName, a.lastName, ae.registrationStatus
            FROM Attendees_Events ae
            JOIN Events e ON ae.eventID = e.eventID
            JOIN Attendees a ON ae.attendeeID = a.attendeeID;
        `);
        const [eventResults] = await db.tylerPool.query(`SELECT eventID, eventName FROM Events`);
        const [attendeeResults] = await db.tylerPool.query(`SELECT attendeeID, firstName, lastName FROM Attendees`);

        res.render('attendees_events', {
            registrations: registrationResults,
            events: eventResults,
            attendees: attendeeResults
        });
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ error: "Database error while retrieving registrations" });
    }
});

// POST /add-attendee-event - Add an event registration
app.post('/add-attendee-event', async (req, res) => {
    const { eventName, firstName, lastName, registrationStatus } = req.body;

    if (!eventName || !firstName || !lastName || !registrationStatus) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        await db.tylerPool.query(
            `
                INSERT INTO Attendees_Events (eventID, attendeeID, registrationStatus) 
                SELECT e.eventID, a.attendeeID, ?
                FROM Events e, Attendees a
                WHERE e.eventName = ? AND a.firstName = ? AND a.lastName = ?
                ON DUPLICATE KEY UPDATE registrationStatus = VALUES(registrationStatus);
            `,
            [registrationStatus, eventName, firstName, lastName]
        );

        console.log("Registration added/updated successfully");
        res.json({ success: "Registration added/updated successfully" });
    } catch (error) {
        console.error("Error adding/updating registration:", error);
        return res.status(500).json({ error: "Failed to add/update registration." });
    }
});

// POST /update-attendee-event - Update an event registration
app.post('/update-attendee-event', async (req, res) => {
    const { eventName, firstName, lastName, registrationStatus } = req.body;

    if (!eventName || !firstName || !lastName || !registrationStatus) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        await db.tylerPool.query(
            `
                UPDATE Attendees_Events 
                SET registrationStatus = ?
                WHERE eventID = (SELECT eventID FROM Events WHERE eventName = ?)
                  AND attendeeID = (SELECT attendeeID FROM Attendees WHERE firstName = ? AND lastName = ?);
            `,
            [registrationStatus, eventName, firstName, lastName]
        );

        console.log("Registration updated successfully");
        res.json({ success: "Registration updated successfully" });
    } catch (error) {
        console.error("Error updating registration:", error);
        return res.status(500).json({ error: "Failed to update registration." });
    }
});

// POST /delete-attendee-event - Delete an event registration
app.post('/delete-attendee-event', async (req, res) => {
    const { eventID, attendeeID } = req.body;

    if (!eventID || !attendeeID) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        await db.tylerPool.query(
            `
                DELETE FROM Attendees_Events 
                WHERE eventID = ? AND attendeeID = ?;
            `,
            [eventID, attendeeID]
        );

        console.log("Registration deleted successfully");
        res.json({ success: "Registration deleted successfully" });
    } catch (error) {
        console.error("Error deleting registration:", error);
        return res.status(500).json({ error: "Failed to delete registration." });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://classwork.engr.oregonstate.edu:${port}`);
});
