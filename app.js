// Setup
var db = require('./db-connector');  // Import database connection pools
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 9012;

// Handlebars Setup
var exphbs = require('express-handlebars');
app.engine("handlebars", exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts")
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));  // Explicitly set the views directory

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Ensure Express serves files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


// Routes

// Index Page
app.get('/', function(req, res) {
    res.status(200).render("index", { title: "Home" });  // Pass title for homepage
});

// Events Page - Display all events
app.get('/events', function(req, res) {
    let eventQuery = `
        SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, e.description, e.requiresPayment, e.maxAttendees
        FROM Events e
        JOIN Venues v ON e.venueID = v.venueID
        JOIN Organizers o ON e.organizerID = o.organizerID;
    `;

    let venueQuery = `SELECT venueID, venueName FROM Venues;`;  // Fetch all venues
    let organizerQuery = `SELECT organizerID, organizerName FROM Organizers;`;  // Fetch all organizers

    db.tylerPool.query(eventQuery, function(error, eventRows) {
        if (error) {
            console.log("Event Query Error:", error);
            res.sendStatus(500);
            return;
        }

        db.tylerPool.query(venueQuery, function(error, venueRows) {
            if (error) {
                console.log("Venue Query Error:", error);
                res.sendStatus(500);
                return;
            }

            db.tylerPool.query(organizerQuery, function(error, organizerRows) {
                if (error) {
                    console.log("Organizer Query Error:", error);
                    res.sendStatus(500);
                    return;
                }

                res.status(200).render("events", {
                    data: eventRows,         // Pass event data
                    venues: venueRows,       // Pass venue data
                    organizers: organizerRows // Pass organizer data
                });
            });
        });
    });
});


// Add Event - Handle POST request to add a new event
app.post('/add-event', function(req, res) {
    console.log("📌 POST request received for /add-event");
    let data = req.body;

    // Check if the venue exists; insert if not
    let venueQuery = `
        INSERT INTO Venues (venueName, address, capacity)
        SELECT ?, 'Unknown Address', 100
        WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE venueName = ?) 
        LIMIT 1;
    `;

    db.tylerPool.query(venueQuery, [data.venueName, data.venueName], function(venueError) {
        if (venueError) {
            console.error("❌ Venue Insert Error:", venueError);
            return res.status(400).json({ error: "Failed to insert venue." });
        }

        // Get venue ID
        let getVenueIDQuery = "SELECT venueID FROM Venues WHERE venueName = ?";
        db.tylerPool.query(getVenueIDQuery, [data.venueName], function(err, venueRows) {
            if (err || venueRows.length === 0) {
                console.error("❌ Venue Lookup Error:", err);
                return res.status(400).json({ error: "Failed to get venue ID." });
            }
            let venueID = venueRows[0].venueID;

            // Check if the organizer exists; insert if not
            let organizerQuery = `
                INSERT INTO Organizers (organizerName, email)
                SELECT ?, 'unknown@example.com'
                WHERE NOT EXISTS (SELECT 1 FROM Organizers WHERE organizerName = ?) 
                LIMIT 1;
            `;

            db.tylerPool.query(organizerQuery, [data.organizerName, data.organizerName], function(organizerError) {
                if (organizerError) {
                    console.error("❌ Organizer Insert Error:", organizerError);
                    return res.status(400).json({ error: "Failed to insert organizer." });
                }

                // Get organizer ID
                let getOrganizerIDQuery = "SELECT organizerID FROM Organizers WHERE organizerName = ?";
                db.tylerPool.query(getOrganizerIDQuery, [data.organizerName], function(err, organizerRows) {
                    if (err || organizerRows.length === 0) {
                        return res.status(400).json({ error: "Failed to get organizer ID." });
                    }
                    let organizerID = organizerRows[0].organizerID;

                    // Insert event
                    let eventQuery = `
                        INSERT INTO Events (eventName, eventDate, venueID, organizerID, description, requiresPayment, maxAttendees)
                        VALUES (?, ?, ?, ?, ?, ?, ?);
                    `;

                    db.tylerPool.query(eventQuery, [data.eventName, data.eventDate, venueID, organizerID, data.description, data.requiresPayment, data.maxAttendees], function(eventError, result) {
                        if (eventError) return res.status(400).json({ error: "Failed to insert event." });
                        res.json({ eventID: result.insertId });
                    });
                });
            });
        });
    });
});




// Update Event - Handle POST request to update an event
// Update Event - Handle POST request to update an event
app.post('/update-event', function(req, res) {
    console.log("📌 POST request received for /update-event");

    let data = req.body;

    // Step 1: Insert new venue if it does not exist
    let venueQuery = `
        INSERT INTO Venues (venueName, address, capacity)
        SELECT ?, 'Unknown Address', 100
        WHERE NOT EXISTS (SELECT 1 FROM Venues WHERE venueName = ?)
        LIMIT 1;
    `;

    db.tylerPool.query(venueQuery, [data.venueName, data.venueName], function(venueError) {
        if (venueError) {
            console.error("❌ Venue Insert Error:", venueError);
            return res.status(400).json({ error: "Failed to insert venue." });
        }

        // Step 2: Get the venueID
        let getVenueIDQuery = "SELECT venueID FROM Venues WHERE venueName = ?";
        db.tylerPool.query(getVenueIDQuery, [data.venueName], function(err, venueRows) {
            if (err || venueRows.length === 0) {
                console.error("❌ Venue Lookup Error:", err);
                return res.status(400).json({ error: "Failed to get venue ID." });
            }
            let venueID = venueRows[0].venueID;

            // Step 3: Insert new organizer if it does not exist
            let organizerQuery = `
                INSERT INTO Organizers (organizerName, email)
                SELECT ?, 'unknown@example.com'
                WHERE NOT EXISTS (SELECT 1 FROM Organizers WHERE organizerName = ?)
                LIMIT 1;
            `;

            db.tylerPool.query(organizerQuery, [data.organizerName, data.organizerName], function(organizerError) {
                if (organizerError) {
                    console.error("❌ Organizer Insert Error:", organizerError);
                    return res.status(400).json({ error: "Failed to insert organizer." });
                }

                // Step 4: Get the organizerID
                let getOrganizerIDQuery = "SELECT organizerID FROM Organizers WHERE organizerName = ?";
                db.tylerPool.query(getOrganizerIDQuery, [data.organizerName], function(err, organizerRows) {
                    if (err || organizerRows.length === 0) {
                        return res.status(400).json({ error: "Failed to get organizer ID." });
                    }
                    let organizerID = organizerRows[0].organizerID;

                    // Step 5: Update the event
                    let updateQuery = `
                        UPDATE Events 
                        SET eventName = ?, eventDate = ?, 
                            venueID = ?, organizerID = ?, 
                            description = ?, requiresPayment = ?, maxAttendees = ? 
                        WHERE eventID = ?;
                    `;

                    db.tylerPool.query(updateQuery, [data.eventName, data.eventDate, venueID, organizerID, data.description, data.requiresPayment, data.maxAttendees, data.eventID], function(updateError) {
                        if (updateError) {
                            console.error("❌ Update Error:", updateError);
                            return res.status(400).json({ error: "Failed to update event." });
                        }

                        // Step 6: Fetch the updated event and return it
                        let selectQuery = `
                            SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, 
                                   e.description, e.requiresPayment, e.maxAttendees
                            FROM Events e
                            JOIN Venues v ON e.venueID = v.venueID
                            JOIN Organizers o ON e.organizerID = o.organizerID
                            WHERE e.eventID = ?;
                        `;

                        db.tylerPool.query(selectQuery, [data.eventID], function(selectError, rows) {
                            if (selectError) {
                                console.error("❌ Select Error:", selectError);
                                return res.status(400).json({ error: "Failed to retrieve updated event." });
                            }
                            res.json(rows[0]); // Send back the updated event
                        });
                    });
                });
            });
        });
    });
});


// Delete Event - Handle DELETE request to remove an event
app.post('/delete-event', function(req, res) {
    let data = req.body;

    let query = `
        DELETE FROM Attendees_Events WHERE eventID = ?;
        DELETE FROM Payments WHERE eventID = ?;
        DELETE FROM Events WHERE eventID = ?;
    `;
    
    // Use Nicholas's database connection pool for deleting events
    db.tylerPool.query(query, [data.eventID, data.eventID, data.eventID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.redirect('/events');  // Redirect to events page after successful deletion
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://classwork.engr.oregonstate.edu:${port}`);
});
