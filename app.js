// app.js
// Setup
var db = require('./db-connector');
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 9011;

// Handlebars Setup
var exphbs = require('express-handlebars');
app.engine("handlebars", exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts")
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

    // ... (rest of update-event code remains the same)
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


// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});