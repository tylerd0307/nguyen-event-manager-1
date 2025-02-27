// Setup
var db = require('./db-connector');  // Import database connection pools
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 9012;

// Handlebars Setup
var exphbs = require('express-handlebars');
app.engine("handlebars", exphbs.engine({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
    let data = req.body;

    // Get IDs for the venue and organizer from the names provided in the form
    let query = `
        INSERT INTO Events (eventName, eventDate, venueID, organizerID, description, requiresPayment, maxAttendees)
        SELECT ?, ?, v.venueID, o.organizerID, ?, ?, ?
        FROM Venues v, Organizers o
        WHERE v.venueName = ? AND o.organizerName = ?;
    `;
    
    // Use Nicholas's database connection pool for adding events
    db.tylerPool.query(query, [data.eventName, data.eventDate, data.description, data.requiresPayment, data.maxAttendees, data.venueName, data.organizerName], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.redirect('/events');  // Redirect to events page after successful insertion
        }
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

// Listener
app.listen(port, function() {
    console.log('Express started on http://localhost:' + port + '; press Ctrl-C to terminate.');
});
