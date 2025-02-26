-- Project Group 50
-- Tyler Nguyen
-- Nicholas Nguyen

-- Disable foreign key checks and autocommit for clean import
-- This ensures that tables can be dropped and recreated without integrity constraints interfering.
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;

-- Drop existing tables if they exist
-- This prevents conflicts with pre-existing tables by removing them before recreating.
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Attendees_Events;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Attendees;
DROP TABLE IF EXISTS Venues;
DROP TABLE IF EXISTS Organizers;

-- Create Organizers table
-- Stores information about event organizers, ensuring each has a unique email.
CREATE TABLE Organizers (
    organizerID INT AUTO_INCREMENT PRIMARY KEY,
    organizerName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phoneNumber VARCHAR(15) NULL -- Optional contact information
);

-- Create Venues table
-- Stores details about event locations, including capacity constraints.
CREATE TABLE Venues (
    venueID INT PRIMARY KEY, -- Manual ID assignment allows external reference control
    venueName VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    capacity INT NOT NULL, -- Ensures events do not exceed venue limits
    contactNumber VARCHAR(15) NULL -- Optional venue contact information
);

-- Create Events table
-- Stores event details, linking each event to a venue and an organizer.
CREATE TABLE Events (
    eventID INT AUTO_INCREMENT PRIMARY KEY,
    eventName VARCHAR(255) NOT NULL,
    eventDate DATE NOT NULL,
    venueID INT NOT NULL,
    organizerID INT NOT NULL,
    description TEXT NULL,
    requiresPayment BOOLEAN NOT NULL DEFAULT 1, -- Determines if payment is required
    maxAttendees INT NOT NULL, -- Restricts attendee count based on venue capacity
    FOREIGN KEY (venueID) REFERENCES Venues(venueID) ON DELETE CASCADE, -- Ensures event removal if venue is deleted
    FOREIGN KEY (organizerID) REFERENCES Organizers(organizerID) ON DELETE CASCADE -- Deletes events if organizer is removed
);

-- Create Attendees table
-- Stores registrant details, ensuring unique email addresses.
CREATE TABLE Attendees (
    attendeeID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Prevents duplicate registrations
    phoneNumber VARCHAR(15) NULL -- Optional contact information
);

-- Create Attendees_Events intersection table
-- Manages many-to-many relationships between attendees and events.
CREATE TABLE Attendees_Events (
    eventID INT NOT NULL,
    attendeeID INT NOT NULL,
    registrationStatus ENUM('Registered', 'Pending', 'Cancelled') NOT NULL, -- Tracks registration status
    PRIMARY KEY (eventID, attendeeID), -- Ensures unique event-attendee relationships
    FOREIGN KEY (eventID) REFERENCES Events(eventID) ON DELETE CASCADE, -- Removes registrations if event is deleted
    FOREIGN KEY (attendeeID) REFERENCES Attendees(attendeeID) ON DELETE CASCADE -- Removes registrations if attendee is deleted
);

-- Create Payments table
-- Tracks payments for paid events, allowing null event IDs for general payments.
CREATE TABLE Payments (
    paymentID INT AUTO_INCREMENT PRIMARY KEY,
    eventID INT NULL, -- Allows payments not linked to specific events
    attendeeID INT NOT NULL,
    paymentDate DATE NOT NULL,
    paymentStatus ENUM('Paid', 'Pending', 'Not Required') NOT NULL, -- Tracks payment progress
    FOREIGN KEY (eventID) REFERENCES Events(eventID) ON DELETE SET NULL, -- Keeps payment record even if event is deleted
    FOREIGN KEY (attendeeID) REFERENCES Attendees(attendeeID) ON DELETE CASCADE -- Removes payments if attendee is deleted
);

-- Insert example data
-- Prepopulated records for testing

-- Insert Organizers
INSERT INTO Organizers (organizerName, email, phoneNumber) VALUES
('John Doe', 'john.doe@gmail.com', '555-2342'),
('Jane Doe', 'jane.doe@gmail.com', '555-6234'),
('LeBron James', 'lebron.james@gmail.com', '555-7232');

-- Insert Venues with specific IDs
INSERT INTO Venues (venueID, venueName, address, capacity, contactNumber) VALUES
(101, 'Grand Hall', '123 Conference St', 500, '555-1111'),
(102, 'Meeting Room A', '456 Office Rd', 100, '555-2222'),
(103, 'Tech Lab', '789 Innovation Dr', 200, '555-3333');

-- Insert Events with matching venueIDs
INSERT INTO Events (eventName, eventDate, venueID, organizerID, description, requiresPayment, maxAttendees) VALUES
('Tech Conference', '2024-04-01', 101, 1, 'A conference on the latest tech trends.', 0, 200),
('Marketing Meetup', '2024-05-10', 102, 2, NULL, 1, 100),
('Developer Workshop', '2025-06-15', 103, 1, 'A workshop to learn new coding techniques.', 1, 150),
('AI Symposium', '2025-07-20', 101, 3, 'A discussion on AI advancements.', 1, 250);

-- Insert Attendees
INSERT INTO Attendees (firstName, lastName, email, phoneNumber) VALUES
('Tyler', 'Nguyen', 'tyler.nguyen@gmail.com', NULL),
('Alice', 'Johnson', 'alice.johnson@gmail.com', '555-9376'),
('Nicholas', 'Nguyen', 'nicholas.nguyen@gmail.com', '555-4321');

-- Insert Attendees_Events
INSERT INTO Attendees_Events (eventID, attendeeID, registrationStatus) VALUES
(1, 1, 'Registered'),
(3, 1, 'Registered'),
(2, 2, 'Pending'),
(4, 3, 'Pending');

-- Insert Payments
INSERT INTO Payments (eventID, attendeeID, paymentDate, paymentStatus) VALUES
(1, 1, '2024-03-25', 'Not Required'),
(2, 2, '2024-04-02', 'Pending'),
(3, 1, '2024-05-21', 'Paid'),
(4, 3, '2024-05-29', 'Pending');

-- Re-enable foreign key checks and commit transactions
-- Restores normal constraint enforcement after setup
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

-- Ensure future Venues have proper IDs
ALTER TABLE Venues AUTO_INCREMENT = 104;
