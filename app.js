const express = require('express');
const app = express();
const PORT = 9371;

const { tylerPool } = require('./db-connector');

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------
// ROUTES FOR "EVENTS"
// -------------------------------------------------

// 1) READ: Show all Events
app.get('/events', (req, res) => {
    const query = `
      SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, e.description, e.requiresPayment, e.maxAttendees
      FROM Events e
      JOIN Venues v ON e.venueID = v.venueID
      JOIN Organizers o ON e.organizerID = o.organizerID
      ORDER BY e.eventDate DESC;
    `;
  
    tylerPool.query(query, (err, rows) => {
      if (err) {
        console.error('Error fetching events:', err);
        return res.status(500).send('Database error.');
      }
      res.json(rows);
    });
});

// 2) CREATE: Insert a new Event
app.post('/events/insert', (req, res) => {
    const { eventName, eventDate, venueName, organizerName, description, requiresPayment, maxAttendees } = req.body;
  
    if (!eventName || !eventDate || !venueName || !organizerName) {
      return res.status(400).send('Event name, date, venue name, and organizer name are required.');
    }
  
    const insertQuery = `
      INSERT INTO Events (eventName, eventDate, venueID, organizerID, description, requiresPayment, maxAttendees)
      SELECT ?, ?, v.venueID, o.organizerID, ?, ?, ?
      FROM Venues v, Organizers o
      WHERE v.venueName = ? AND o.organizerName = ?;
    `;
  
    tylerPool.query(insertQuery, [eventName, eventDate, description, requiresPayment, maxAttendees, venueName, organizerName], (err) => {
      if (err) {
        console.error('Error inserting event:', err);
        return res.status(500).send('Database error.');
      }
      res.redirect('/events.html');
    });
});

// 3) UPDATE: Modify an existing Event
app.post('/events/update', (req, res) => {
    const { eventID, eventName, eventDate, venueName, organizerName, description, requiresPayment, maxAttendees } = req.body;
  
    if (!eventID || !eventName || !eventDate || !venueName || !organizerName) {
      return res.status(400).send('All fields are required.');
    }
  
    const updateQuery = `
      UPDATE Events
      SET eventName = ?, eventDate = ?, venueID = (SELECT venueID FROM Venues WHERE venueName = ?), 
          organizerID = (SELECT organizerID FROM Organizers WHERE organizerName = ?), description = ?, 
          requiresPayment = ?, maxAttendees = ?
      WHERE eventID = ?;
    `;
  
    tylerPool.query(updateQuery, [eventName, eventDate, venueName, organizerName, description, requiresPayment, maxAttendees, eventID], (err) => {
      if (err) {
        console.error('Error updating event:', err);
        return res.status(500).send('Database error.');
      }
      res.redirect('/events.html');
    });
});

// 4) DELETE: Remove an Event
app.post('/events/delete', (req, res) => {
    const { eventID } = req.body;
  
    if (!eventID) {
      return res.status(400).send('Event ID is required.');
    }
  
    const deleteQuery = `
      DELETE FROM Attendees_Events WHERE eventID = ?;
      DELETE FROM Payments WHERE eventID = ?;
      DELETE FROM Events WHERE eventID = ?;
    `;
  
    tylerPool.query(deleteQuery, [eventID, eventID, eventID], (err) => {
      if (err) {
        console.error('Error deleting event:', err);
        return res.status(500).send('Database error.');
      }
      res.redirect('/events.html');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://classwork.engr.oregonstate.edu:${PORT}`);
});
