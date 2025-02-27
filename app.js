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
    let query = `
        SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, e.description, e.requiresPayment, e.maxAttendees
        FROM Events e
        JOIN Venues v ON e.venueID = v.venueID
        JOIN Organizers o ON e.organizerID = o.organizerID;
    `;
    // Use Tyler's database connection pool
    db.tylerPool.query(query, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
        } else {
            res.status(200).render("events", { data: rows });  // Render events page with data
        }
    });
});

// Add Event - Handle POST request to add a new event
app.post('/add-event', function(req, res) {
    console.log("POST request received for /add-event");
    let data = req.body;

    // SQL query for inserting event into the database
    let query = `
        INSERT INTO Events (eventName, eventDate, venueID, organizerID, description, requiresPayment, maxAttendees)
        SELECT ?, ?, v.venueID, o.organizerID, ?, ?, ?
        FROM Venues v, Organizers o
        WHERE v.venueName = ? AND o.organizerName = ?;
    `;
    
    db.tylerPool.query(query, [data.eventName, data.eventDate, data.description, data.requiresPayment, data.maxAttendees, data.venueName, data.organizerName], function(error, result) {
        if (error) {
            console.log("Insert Error:", error);
            return res.status(400).json({ error: "Failed to insert event." });
        }

        let eventID = result.insertId; // Get the new event's ID

        // Fetch the newly inserted event
        let selectQuery = `
            SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, 
                   e.description, e.requiresPayment, e.maxAttendees
            FROM Events e
            JOIN Venues v ON e.venueID = v.venueID
            JOIN Organizers o ON e.organizerID = o.organizerID
            WHERE e.eventID = ?;
        `;
        
        db.tylerPool.query(selectQuery, [eventID], function(selectError, rows) {
            if (selectError) {
                console.log("Select Error:", selectError);
                return res.status(400).json({ error: "Failed to retrieve new event." });
            }

            if (rows.length === 0) {
                console.log("Event inserted but not found in DB.");
                return res.status(404).json({ error: "Event not found after insertion." });
            }

            res.json(rows[0]); // Send the inserted event as JSON
        });
    });
});




// Update Event - Handle POST request to update an event
app.post('/update-event', function(req, res) {
    let data = req.body;
    
    let query = `
        UPDATE Events 
        SET eventName = ?, eventDate = ?, 
            venueID = (SELECT venueID FROM Venues WHERE venueName = ?), 
            organizerID = (SELECT organizerID FROM Organizers WHERE organizerName = ?), 
            description = ?, requiresPayment = ?, maxAttendees = ? 
        WHERE eventID = ?;
    `;

    // Use Tyler's database connection pool for updating events
    db.tylerPool.query(query, [data.eventName, data.eventDate, data.venueName, data.organizerName, data.description, data.requiresPayment, data.maxAttendees, data.eventID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.redirect('/events');  // Redirect to events page after successful update
        }
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
