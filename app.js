// app.js
// Setup
var db = require('./db-connector');
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 9010;

// Import Moment.js
const moment = require('moment');

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

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Index Page
app.get('/', function(req, res) {
    res.status(200).render("index", { title: "Home" });
});

// Events Page - Display all events
app.get('/events', function(req, res) {
    let eventQuery = `
        SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, e.description, e.requiresPayment, e.maxAttendees
        FROM Events e
        JOIN Venues v ON e.venueID = v.venueID
        JOIN Organizers o ON e.organizerID = o.organizerID;
    `;

    let venueQuery = `SELECT venueID, venueName FROM Venues;`;
    let organizerQuery = `SELECT organizerID, organizerName FROM Organizers;`;

    db.nicholasPool.query(eventQuery, function(error, eventRows) {
        if (error) {
            console.log("Event Query Error:", error);
            res.sendStatus(500);
            return;
        }

        db.nicholasPool.query(venueQuery, function(error, venueRows) {
            if (error) {
                console.log("Venue Query Error:", error);
                res.sendStatus(500);
                return;
            }

            db.nicholasPool.query(organizerQuery, function(error, organizerRows) {
                if (error) {
                    console.log("Organizer Query Error:", error);
                    res.sendStatus(500);
                    return;
                }

                res.status(200).render("events", {
                    data: eventRows,
                    venues: venueRows,
                    organizers: organizerRows
                });
            });
        });
    });
});

// Add Event - Handle POST request to add a new event
app.post('/add-event', function(req, res) {
    console.log("📌 POST request received for /add-event");
    let data = req.body;

    let venueQuery = `
        INSERT INTO Venues (venueName, address, capacity)
        SELECT ?, 'Unknown Address', 100
        WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE venueName = ?) 
        LIMIT 1;
    `;

    db.nicholasPool.query(venueQuery, [data.venueName, data.venueName], function(venueError) {
        if (venueError) {
            console.error("❌ Venue Insert Error:", venueError);
            return res.status(400).json({ error: "Failed to insert venue." });
        }

        let getVenueIDQuery = "SELECT venueID FROM Venues WHERE venueName = ?";
        db.nicholasPool.query(getVenueIDQuery, [data.venueName], function(err, venueRows) {
            if (err || venueRows.length === 0) {
                console.error("❌ Venue Lookup Error:", err);
                return res.status(400).json({ error: "Failed to get venue ID." });
            }
            let venueID = venueRows[0].venueID;

            let organizerQuery = `
                INSERT INTO Organizers (organizerName, email)
                SELECT ?, 'unknown@example.com'
                WHERE NOT EXISTS (SELECT 1 FROM Organizers WHERE organizerName = ?) 
                LIMIT 1;
            `;

            db.nicholasPool.query(organizerQuery, [data.organizerName, data.organizerName], function(organizerError) {
                if (organizerError) {
                    console.error("❌ Organizer Insert Error:", organizerError);
                    return res.status(400).json({ error: "Failed to insert organizer." });
                }

                let getOrganizerIDQuery = "SELECT organizerID FROM Organizers WHERE organizerName = ?";
                db.nicholasPool.query(getOrganizerIDQuery, [data.organizerName], function(err, organizerRows) {
                    if (err || organizerRows.length === 0) {
                        return res.status(400).json({ error: "Failed to get organizer ID." });
                    }
                    let organizerID = organizerRows[0].organizerID;

                    let eventQuery = `
                        INSERT INTO Events (eventName, eventDate, venueID, organizerID, description, requiresPayment, maxAttendees)
                        VALUES (?, ?, ?, ?, ?, ?, ?);
                    `;

                    db.nicholasPool.query(eventQuery, [data.eventName, data.eventDate, venueID, organizerID, data.description, data.requiresPayment, data.maxAttendees], function(eventError, result) {
                        if (eventError) return res.status(400).json({ error: "Failed to insert event." });
                        res.json({ eventID: result.insertId });
                    });
                });
            });
        });
    });
});

// Update Event - Handle POST request to update an event
app.post('/update-event', function(req, res) {
    console.log("📌 POST request received for /update-event");
    console.log("📌 Received Data:", req.body);

    let data = req.body;

    if (!data.eventID || !data.eventName || !data.eventDate) {
        console.error("❌ Missing required fields!");
        return res.status(400).json({ error: "Missing required fields." });
    }

    // Step 1: Check if venue exists, insert if not
    let venueQuery = `
        INSERT INTO Venues (venueName, address, capacity)
        SELECT ?, 'Unknown Address', 100
        WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE venueName = ?) 
        LIMIT 1;
    `;
    db.nicholasPool.query(venueQuery, [data.venueName, data.venueName], function(venueError) {
        if (venueError) {
            console.error("❌ Venue Insert Error:", venueError);
            return res.status(400).json({ error: "Failed to insert venue." });
        }

        // Get venue ID
        let getVenueIDQuery = "SELECT venueID FROM Venues WHERE venueName = ?";
        db.nicholasPool.query(getVenueIDQuery, [data.venueName], function(err, venueRows) {
            if (err || venueRows.length === 0) {
                console.error("❌ Venue Lookup Error:", err);
                return res.status(400).json({ error: "Failed to get venue ID." });
            }
            let venueID = venueRows[0].venueID;

            // Step 2: Check if organizer exists, insert if not
            let organizerQuery = `
                INSERT INTO Organizers (organizerName, email)
                SELECT ?, 'unknown@example.com'
                WHERE NOT EXISTS (SELECT 1 FROM Organizers WHERE organizerName = ?) 
                LIMIT 1;
            `;

            db.nicholasPool.query(organizerQuery, [data.organizerName, data.organizerName], function(organizerError) {
                if (organizerError) {
                    console.error("❌ Organizer Insert Error:", organizerError);
                    return res.status(400).json({ error: "Failed to insert organizer." });
                }

                // Get organizer ID
                let getOrganizerIDQuery = "SELECT organizerID FROM Organizers WHERE organizerName = ?";
                db.nicholasPool.query(getOrganizerIDQuery, [data.organizerName], function(err, organizerRows) {
                    if (err || organizerRows.length === 0) {
                        return res.status(400).json({ error: "Failed to get organizer ID." });
                    }
                    let organizerID = organizerRows[0].organizerID;

                    // Step 3: Update the event
                    let updateQuery = `
                        UPDATE Events 
                        SET eventName = ?, eventDate = ?, 
                            venueID = ?, organizerID = ?, 
                            description = ?, requiresPayment = ?, maxAttendees = ? 
                        WHERE eventID = ?;
                    `;

                    db.nicholasPool.query(updateQuery, [data.eventName, data.eventDate, venueID, organizerID, data.description, data.requiresPayment, data.maxAttendees, data.eventID], function(updateError) {
                        if (updateError) {
                            console.error("❌ Update Error:", updateError);
                            return res.status(400).json({ error: "Failed to update event." });
                        }

                        console.log("✅ Event successfully updated!");

                        // Step 4: Retrieve updated event and return it
                        let selectQuery = `
                            SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, 
                                   e.description, e.requiresPayment, e.maxAttendees
                            FROM Events e
                            JOIN Venues v ON e.venueID = v.venueID
                            JOIN Organizers o ON e.organizerID = o.organizerID
                            WHERE e.eventID = ?;
                        `;
                        
                        db.nicholasPool.query(selectQuery, [data.eventID], function(selectError, result) {
                            if (selectError || result.length === 0) {
                                return res.status(400).json({ error: "Failed to fetch updated event." });
                            }

                            res.json({ updatedEvent: result[0] });
                        });
                    });
                });
            });
        });
    });
});

// Delete Event - Handle DELETE request to delete an event
app.post('/delete-event', function(req, res) {
    console.log("📌 POST request received for /delete-event");
    console.log("📌 Received Data:", req.body);

    let eventID = req.body.eventID;

    if (!eventID) {
        return res.status(400).json({ error: "Missing eventID." });
    }

    // ... (rest of delete-event code remains the same)
});

app.get('/attendees', function(req, res) {
    let attendeeQuery = `SELECT attendeeID, firstName, lastName, email, phoneNumber FROM Attendees;`;

    db.tylerPool.query(attendeeQuery, function(error, attendeeRows) {
        if (error) {
            console.log("Attendee Query Error:", error);
            res.sendStatus(500);
            return;
        }

        res.status(200).render("attendees", {
            data: attendeeRows,
        });
    });
});

app.post('/add-attendee', function(req, res) {
    let data = req.body;
    console.log("Received data:", req.body);

    // Validate that required fields are present
    if (!data.firstName || !data.lastName || !data.email) {
        return res.status(400).json({ error: "Missing required fields (firstName, lastName, email)." });
    }

    // SQL query to insert a new attendee
    let sql = `
        INSERT INTO Attendees (firstName, lastName, email, phoneNumber) 
        VALUES (?, ?, ?, ?);
    `;

    // Execute the query with the provided data
    db.tylerPool.query(sql, [data.firstName, data.lastName, data.email, data.phone], function(error, result) {
        if (error) {
            console.error("❌ Error adding attendee:", error);
            return res.status(500).json({ error: "Failed to add attendee." });
        }

        console.log("✅ Attendee added successfully!");
        res.status(200).json({ success: "Attendee added successfully!", attendeeID: result.insertId });
    });
});

app.post('/update-attendee', function(req, res) {
    console.log("Update Attendee Request Received"); // Log when the request arrives
    let data = req.body;
    console.log("Received data:", data); // Log the received data

    // Validate that required fields are present
    if (!data.attendeeID || !data.newAttendeeFirstName || !data.newAttendeeLastName || !data.newAttendeeEmail) {
        return res.status(400).json({ error: "Missing required fields (attendeeID, newAttendeeFirstName, newAttendeeLastName, newAttendeeEmail)." });
    }

    // SQL query to update an attendee
    let sql = `
        UPDATE Attendees 
        SET firstName = ?, 
            lastName = ?, 
            email = ?, 
            phoneNumber = ? 
        WHERE attendeeID = ?;
    `;

    // Execute the query with the provided data
    db.tylerPool.query(sql, [data.newAttendeeFirstName, data.newAttendeeLastName, data.newAttendeeEmail, data.newAttendeePhone, data.attendeeID], function(error, result) {
        if (error) {
            console.error("❌ Error updating attendee:", error);
            return res.status(500).json({ error: "Failed to update attendee." });
        }

        console.log("✅ Attendee updated successfully!");
        res.status(200).json({ success: "Attendee updated successfully!" });
    });
});

// Delete Attendee - Handle POST request to delete an attendee
app.post('/delete-attendee', function(req, res) {
    console.log("📌 POST request received for /delete-attendee");
    console.log("📌 Received Data:", req.body);

    let attendeeID = req.body.attendeeID;

    if (!attendeeID) {
        return res.status(400).json({ error: "Missing attendeeID." });
    }

    // SQL query to delete the attendee
    let deleteQuery = `
        DELETE FROM Attendees WHERE attendeeID = ?;
    `;

    db.tylerPool.query(deleteQuery, [attendeeID], function(error, result) {
        if (error) {
            console.error("❌ Error deleting attendee:", error);
            return res.status(500).json({ error: "Failed to delete attendee." });
        }

        console.log("✅ Attendee deleted successfully!");
        res.json({ success: "Attendee deleted successfully!" });
    });
});

// Get all organizers
app.get('/organizers', function(req, res) {
    let organizerQuery = `SELECT * FROM Organizers`; 

    db.tylerPool.query(organizerQuery, function(error, organizerRows) { 
        if (error) { 
            console.log("Organizer Query Error:", error); 
            res.sendStatus(500); 
            return; 
        } 

        res.status(200).render("organizers", {  // Render the organizers.handlebars template
            data: organizerRows, 
        }); 
    }); 
});
// Add a new organizer
app.post("/add-organizer", (req, res) => {
    const { organizerName, email, phone } = req.body; // Changed from name to organizerName to match your form
    if (!organizerName || !email) { // Phone is optional, so removed from required check.
        return res.status(400).json({ error: "Organizer Name and Email are required" });
    }

    const query = "INSERT INTO Organizers (organizerName, email, phoneNumber) VALUES (?, ?, ?)";
    db.tylerPool.query(query, [organizerName, email, phone], (err, result) => {
        if (err) {
            console.error("Error adding organizer: ", err);
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.status(201).json({ message: "Organizer added successfully", id: result.insertId });
    });
});

app.post("/update-organizer", (req, res) => {
    const { organizerID, newOrganizerName, newOrganizerEmail, newOrganizerPhone } = req.body;

    // Basic validation to check if required fields are present
    if (!organizerID || !newOrganizerName || !newOrganizerEmail) {
        return res.status(400).json({ error: "Missing required fields (organizerID, newOrganizerName, newOrganizerEmail)." });
    }

    // SQL query to update an organizer
    const query = `
        UPDATE Organizers 
        SET organizerName = ?, 
            email = ?, 
            phoneNumber = ? 
        WHERE organizerID = ?;
    `;

    // Execute the query with the provided data
    db.tylerPool.query(
        query,
        [newOrganizerName, newOrganizerEmail, newOrganizerPhone, organizerID],
        function (error, result) {
            if (error) {
                console.error("Error updating organizer:", error);
                return res.status(500).json({ error: "Failed to update organizer." });
            }

            // Check if any rows were affected by the update
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Organizer not found." });
            }

            console.log("Organizer updated successfully");
            res.json({ success: "Organizer updated successfully" });
        }
    );
});

app.post("/delete-organizer", (req, res) => {
    const { organizerID } = req.body;
    if (!organizerID) {
        return res.status(400).json({ error: "Missing organizerID." });
    }

    const query = `
        DELETE FROM Organizers 
        WHERE organizerID = ?;
    `;

    db.tylerPool.query(query, [organizerID], (err, result) => {
        if (err) {
            console.error("Error deleting organizer: ", err);
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.json({ message: "Organizer deleted successfully" });
    });
});

// GET all payments
app.get('/payments', function(req, res) {
    const paymentsQuery = `
        SELECT p.paymentID, e.eventName, a.firstName, a.lastName, p.paymentDate, p.paymentStatus
        FROM Payments p
        LEFT JOIN Events e ON p.eventID = e.eventID
        JOIN Attendees a ON p.attendeeID = a.attendeeID
    `;
    const eventsQuery = `SELECT eventID, eventName FROM Events`;
    const attendeesQuery = `SELECT attendeeID, firstName, lastName FROM Attendees`;

    db.tylerPool.query(paymentsQuery, function(error, paymentResults) {
        if (error) {
            console.error("Error fetching payments:", error);
            res.status(500).json({ error: "Database error while retrieving payments" });
            return;
        }

        db.tylerPool.query(eventsQuery, function(error, eventResults) {
            if (error) {
                console.error("Error fetching events:", error);
                res.status(500).json({ error: "Database error while retrieving events" });
                return;
            }

            db.tylerPool.query(attendeesQuery, function(error, attendeeResults) {
                if (error) {
                    console.error("Error fetching attendees:", error);
                    res.status(500).json({ error: "Database error while retrieving attendees" });
                    return;
                }

                res.render('payments', {
                    data: paymentResults,
                    events: eventResults,
                    attendees: attendeeResults
                });
            });
        });
    });
});

// POST add a new payment
app.post("/add-payment", (req, res) => {
    const { eventID, attendeeID, paymentDate, paymentStatus } = req.body;
    console.log("Received add-payment request:", req.body);
    if (!eventID || !attendeeID || !paymentDate || !paymentStatus) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO Payments (eventID, attendeeID, paymentDate, paymentStatus) 
        VALUES (?, ?, ?, ?);
    `;
    db.tylerPool.query(query, [eventID, attendeeID, paymentDate, paymentStatus], (err, result) => {
        if (err) {
            console.error("Error adding payment:", err);
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.status(201).json({ message: "Payment added successfully", id: result.insertId });
    });
});

app.post("/update-payment", (req, res) => {
    const { paymentID, newEventID, newAttendeeID, newPaymentDate, newPaymentStatus } = req.body;

    // Basic validation to check if required fields are present
    if (!paymentID || !newEventID || !newAttendeeID || !newPaymentDate || !newPaymentStatus) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // SQL query to update a payment
    const query = `
        UPDATE Payments 
        SET eventID = ?, 
            attendeeID = ?, 
            paymentDate = ?, 
            paymentStatus = ? 
        WHERE paymentID = ?;
    `;

    // Execute the query with the provided data
    db.tylerPool.query(
        query,
        [newEventID, newAttendeeID, newPaymentDate, newPaymentStatus, paymentID],
        (err, result) => {
            if (err) {
                console.error("Error updating payment:", err);
                return res.status(500).json({ error: "Failed to update payment." });
            }

            // Check if any rows were affected by the update
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Payment not found." });
            }

            console.log("Payment updated successfully");
            res.json({ success: "Payment updated successfully" });
        }
    );
});

app.post("/delete-payment", (req, res) => {
    const { paymentID } = req.body;

    // Basic validation to check if paymentID is present
    if (!paymentID) {
        return res.status(400).json({ error: "Missing paymentID." });
    }

    // SQL query to delete a payment
    const query = `
        DELETE FROM Payments 
        WHERE paymentID = ?;
    `;

    // Execute the query with the provided data
    db.tylerPool.query(query, [paymentID], (err, result) => {
        if (err) {
            console.error("Error deleting payment:", err);
            return res.status(500).json({ error: "Failed to delete payment." });
        }

        // Check if any rows were affected by the delete
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Payment not found." });
        }

        console.log("Payment deleted successfully");
        res.json({ success: "Payment deleted successfully" });
    });
});

// GET /venues - Display all venues
app.get('/venues', function(req, res) {
    const query = `SELECT * FROM Venues`;

    db.tylerPool.query(query, function(error, venueRows) {
        if (error) {
            console.log("Venue Query Error:", error);
            res.sendStatus(500);
            return;
        }

        res.status(200).render("venues", {
            data: venueRows
        });
    });
});

// POST /add-venue - Add a new venue
app.post("/add-venue", (req, res) => {
    const { venueName, address, capacity, contactNumber } = req.body;
    if (!venueName || !address || !capacity || !contactNumber) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = "INSERT INTO Venues (venueName, address, capacity, contactNumber) VALUES (?, ?, ?, ?)";
    db.tylerPool.query(query, [venueName, address, capacity, contactNumber], (err, result) => {
        if (err) {
            console.error("Error adding venue: ", err);
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.status(201).json({ message: "Venue added successfully", id: result.insertId });
    });
});

app.post("/update-venue", (req, res) => {
    const { venueID, venueName, address, capacity, contactNumber } = req.body;
    console.log("Received update-venue request:", req.body);

    // Basic validation to check if required fields are present
    if (!venueID || !venueName || !address || !capacity || !contactNumber) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // SQL query to update a venue
    const query = `
        UPDATE Venues 
        SET venueName = ?, 
            address = ?, 
            capacity = ?,
            contactNumber = ?  
        WHERE venueID = ?;
    `;

    // Execute the query with the provided data
    db.tylerPool.query(
        query,
        [venueName, address, capacity, contactNumber, venueID],
        (err, result) => {
            if (err) {
                console.error("Error updating venue:", err);
                return res.status(500).json({ error: "Failed to update venue." });
            }

            // Check if any rows were affected by the update
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Venue not found." });
            }

            console.log("Venue updated successfully");
            res.json({ success: "Venue updated successfully" });
        }
    );
});

app.post("/delete-venue", (req, res) => {
    const { venueID } = req.body;

    // Basic validation to check if venueID is present
    if (!venueID) {
        return res.status(400).json({ error: "Missing venueID." });
    }

    // SQL query to delete a venue
    const query = `
        DELETE FROM Venues 
        WHERE venueID = ?;
    `;

    // Execute the query with the provided data
    db.tylerPool.query(query, [venueID], (err, result) => {
        if (err) {
            console.error("Error deleting venue:", err);
            return res.status(500).json({ error: "Failed to delete venue." });
        }

        // Check if any rows were affected by the delete
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Venue not found." });
        }

        console.log("Venue deleted successfully");
        res.json({ success: "Venue deleted successfully" });
    });
});

/// GET /attendees_events - Display all attendee-event registrations
app.get('/attendees_events', function(req, res) {
    // Disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const registrationsQuery = `
        SELECT e.eventID, e.eventName, a.attendeeID, a.firstName, a.lastName, ae.registrationStatus
        FROM Attendees_Events ae
        JOIN Events e ON ae.eventID = e.eventID
        JOIN Attendees a ON ae.attendeeID = a.attendeeID;
    `;
    const eventsQuery = `SELECT eventID, eventName FROM Events`;
    const attendeesQuery = `SELECT attendeeID, firstName, lastName FROM Attendees`;

    db.tylerPool.query(registrationsQuery, function(error, registrationResults) {
        if (error) {
            console.error("Error fetching registrations:", error);
            res.status(500).json({ error: "Database error while retrieving registrations" });
            return;
        }

        db.tylerPool.query(eventsQuery, function(error, eventResults) {
            if (error) {
                console.error("Error fetching events:", error);
                res.status(500).json({ error: "Database error while retrieving events" });
                return;
            }

            db.tylerPool.query(attendeesQuery, function(error, attendeeResults) {
                if (error) {
                    console.error("Error fetching attendees:", error);
                    res.status(500).json({ error: "Database error while retrieving attendees" });
                    return;
                }

                res.render('attendees_events', {
                    registrations: registrationResults,
                    events: eventResults,
                    attendees: attendeeResults
                });
            });
        });
    });
});

app.post('/add-attendee-event', (req, res) => {
    const { eventName, firstName, lastName, registrationStatus } = req.body;

    // Basic validation to check if required fields are present
    if (!eventName || !firstName || !lastName || !registrationStatus) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // SQL query to insert a new attendee-event registration
    // using eventName, firstName, and lastName to look up eventID and attendeeID
    const query = `
        INSERT INTO Attendees_Events (eventID, attendeeID, registrationStatus) 
        SELECT e.eventID, a.attendeeID, ?
        FROM Events e, Attendees a
        WHERE e.eventName = ? AND a.firstName = ? AND a.lastName = ?
        ON DUPLICATE KEY UPDATE registrationStatus = VALUES(registrationStatus);
    `;

    db.tylerPool.query(
        query, 
        [registrationStatus, eventName, firstName, lastName], 
        (err, result) => {
            if (err) {
                console.error("Error adding/updating registration:", err);
                return res.status(500).json({ error: "Failed to add/update registration." });
            }

            console.log("Registration added/updated successfully");
            res.json({ success: "Registration added/updated successfully" });
        }
    );
});

app.post('/update-attendee-event', (req, res) => {
    const { eventName, firstName, lastName, registrationStatus } = req.body;

    // Basic validation to check if required fields are present
    if (!eventName || !firstName || !lastName || !registrationStatus) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // SQL query to update an attendee-event registration
    // using eventName, firstName, and lastName to identify the registration
    const query = `
        UPDATE Attendees_Events 
        SET registrationStatus = ?
        WHERE eventID = (SELECT eventID FROM Events WHERE eventName = ?)
          AND attendeeID = (SELECT attendeeID FROM Attendees WHERE firstName = ? AND lastName = ?);
    `;

    db.tylerPool.query(
        query, 
        [registrationStatus, eventName, firstName, lastName], 
        (err, result) => {
            if (err) {
                console.error("Error updating registration:", err);
                return res.status(500).json({ error: "Failed to update registration." });
            }

            console.log("Registration updated successfully");
            res.json({ success: "Registration updated successfully" });
        }
    );
});

app.post('/delete-attendee-event', (req, res) => {
    const { eventID, attendeeID } = req.body;

    if (!eventID || !attendeeID) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const query = `
        DELETE FROM Attendees_Events 
        WHERE eventID = ? AND attendeeID = ?;
    `;

    db.tylerPool.query(query, [eventID, attendeeID], (err, result) => {
        if (err) {
            console.error("Error deleting registration:", err);
            return res.status(500).json({ error: "Failed to delete registration." });
        }

        console.log("Registration deleted successfully");
        res.json({ success: "Registration deleted successfully" });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
