-- Project Group 50
-- Tyler Nguyen
-- Nicholas Nguyen

-- The colon (:) character denotes variables that will be populated from the backend programming language.

--------------------------------
-- EVENTS TABLE
--------------------------------

-- SELECT: Retrieve all events with venue and organizer names instead of just IDs
SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, e.description, e.requiresPayment, e.maxAttendees 
FROM Events e
JOIN Venues v ON e.venueID = v.venueID
JOIN Organizers o ON e.organizerID = o.organizerID;

-- SELECT: Retrieve a single event by its ID
SELECT e.eventID, e.eventName, e.eventDate, v.venueName, o.organizerName, e.description, e.requiresPayment, e.maxAttendees 
FROM Events e
JOIN Venues v ON e.venueID = v.venueID
JOIN Organizers o ON e.organizerID = o.organizerID
WHERE e.eventID = :eventIDInput;

-- INSERT: Create a new event using venue and organizer names instead of IDs
INSERT INTO Events (eventName, eventDate, venueID, organizerID, description, requiresPayment, maxAttendees) 
SELECT :eventNameInput, :eventDateInput, v.venueID, o.organizerID, :descriptionInput, :requiresPaymentInput, :maxAttendeesInput
FROM Venues v, Organizers o
WHERE v.venueName = :venueNameInput AND o.organizerName = :organizerNameInput;

-- UPDATE: Modify an existing event using venue and organizer names
UPDATE Events 
SET eventName = :eventNameInput,
    eventDate = :eventDateInput,
    venueID = (SELECT venueID FROM Venues WHERE venueName = :venueNameInput),
    organizerID = (SELECT organizerID FROM Organizers WHERE organizerName = :organizerNameInput),
    description = :descriptionInput,
    requiresPayment = :requiresPaymentInput,
    maxAttendees = :maxAttendeesInput
WHERE eventID = :eventIDInput;

-- DELETE: Remove an event by its ID (handling FK constraints)
DELETE FROM Attendees_Events WHERE eventID = :eventIDInput;
DELETE FROM Payments WHERE eventID = :eventIDInput;
DELETE FROM Events WHERE eventID = :eventIDInput;

--------------------------------
-- ATTENDEES TABLE
--------------------------------

-- SELECT: Retrieve all attendees
SELECT attendeeID, firstName, lastName, email, phoneNumber FROM Attendees;

-- SELECT: Retrieve all events an attendee is registered for, displaying event names
SELECT ae.attendeeID, a.firstName, a.lastName, e.eventName, ae.registrationStatus
FROM Attendees_Events ae
JOIN Attendees a ON ae.attendeeID = a.attendeeID
JOIN Events e ON ae.eventID = e.eventID
WHERE ae.attendeeID = :attendeeIDInput;

-- INSERT: Add a new attendee
INSERT INTO Attendees (firstName, lastName, email, phoneNumber) 
VALUES (:firstNameInput, :lastNameInput, :emailInput, :phoneNumberInput);

-- UPDATE: Modify an attendee’s details
UPDATE Attendees 
SET firstName = :firstNameInput, 
    lastName = :lastNameInput, 
    email = :emailInput, 
    phoneNumber = :phoneNumberInput 
WHERE attendeeID = :attendeeIDInput;

-- DELETE: Remove an attendee (handling FK constraints)
DELETE FROM Attendees_Events WHERE attendeeID = :attendeeIDInput;
DELETE FROM Payments WHERE attendeeID = :attendeeIDInput;
DELETE FROM Attendees WHERE attendeeID = :attendeeIDInput;

--------------------------------
-- VENUES TABLE
--------------------------------

-- SELECT: Retrieve all venues
SELECT venueID, venueName, address, capacity, contactNumber FROM Venues;

-- INSERT: Add a new venue
INSERT INTO Venues (venueName, address, capacity, contactNumber) 
VALUES (:venueNameInput, :addressInput, :capacityInput, :contactNumberInput);

-- UPDATE: Modify venue details
UPDATE Venues 
SET venueName = :venueNameInput, 
    address = :addressInput, 
    capacity = :capacityInput, 
    contactNumber = :contactNumberInput 
WHERE venueID = :venueIDInput;

-- DELETE: Remove a venue
DELETE FROM Events WHERE venueID = :venueIDInput;
DELETE FROM Venues WHERE venueID = :venueIDInput;

--------------------------------
-- ORGANIZERS TABLE
--------------------------------

-- SELECT: Retrieve all organizers
SELECT organizerID, organizerName, email, phoneNumber FROM Organizers;

-- INSERT: Add a new organizer
INSERT INTO Organizers (organizerName, email, phoneNumber) 
VALUES (:organizerNameInput, :emailInput, :phoneNumberInput);

-- UPDATE: Modify organizer details
UPDATE Organizers 
SET organizerName = :organizerNameInput, 
    email = :emailInput, 
    phoneNumber = :phoneNumberInput 
WHERE organizerID = :organizerIDInput;

-- DELETE: Remove an organizer
DELETE FROM Events WHERE organizerID = :organizerIDInput;
DELETE FROM Organizers WHERE organizerID = :organizerIDInput;

--------------------------------
-- PAYMENTS TABLE
--------------------------------

-- SELECT: Retrieve all payments with event and attendee names
SELECT p.paymentID, e.eventName, a.firstName, a.lastName, p.paymentDate, p.paymentStatus
FROM Payments p
JOIN Events e ON p.eventID = e.eventID
JOIN Attendees a ON p.attendeeID = a.attendeeID;

-- INSERT: Record a new payment using event and attendee names
INSERT INTO Payments (eventID, attendeeID, paymentDate, paymentStatus) 
SELECT e.eventID, a.attendeeID, :paymentDateInput, :paymentStatusInput
FROM Events e, Attendees a
WHERE e.eventName = :eventNameInput AND a.firstName = :firstNameInput AND a.lastName = :lastNameInput;

-- UPDATE: Modify an existing payment record
UPDATE Payments 
SET eventID = (SELECT eventID FROM Events WHERE eventName = :eventNameInput),
    attendeeID = (SELECT attendeeID FROM Attendees WHERE firstName = :firstNameInput AND lastName = :lastNameInput),
    paymentDate = :paymentDateInput, 
    paymentStatus = :paymentStatusInput 
WHERE paymentID = :paymentIDInput;

-- DELETE: Remove a payment record
DELETE FROM Payments WHERE paymentID = :paymentIDInput;

--------------------------------
-- ATTENDEES_EVENTS TABLE (Many-to-Many Relationship)
--------------------------------

-- SELECT: Retrieve all attendee-event registrations with names instead of IDs
SELECT e.eventName, a.firstName, a.lastName, ae.registrationStatus
FROM Attendees_Events ae
JOIN Events e ON ae.eventID = e.eventID
JOIN Attendees a ON ae.attendeeID = a.attendeeID;

-- INSERT: Register an attendee for an event using event and attendee names
INSERT INTO Attendees_Events (eventID, attendeeID, registrationStatus) 
SELECT e.eventID, a.attendeeID, :registrationStatusInput
FROM Events e, Attendees a
WHERE e.eventName = :eventNameInput AND a.firstName = :firstNameInput AND a.lastName = :lastNameInput;

-- UPDATE: Change an attendee’s registration status
UPDATE Attendees_Events 
SET registrationStatus = :registrationStatusInput 
WHERE eventID = (SELECT eventID FROM Events WHERE eventName = :eventNameInput)
  AND attendeeID = (SELECT attendeeID FROM Attendees WHERE firstName = :firstNameInput AND lastName = :lastNameInput);

-- DELETE: Remove an attendee from an event using event and attendee names
DELETE FROM Attendees_Events 
WHERE eventID = (SELECT eventID FROM Events WHERE eventName = :eventNameInput)
  AND attendeeID = (SELECT attendeeID FROM Attendees WHERE firstName = :firstNameInput AND lastName = :lastNameInput);
