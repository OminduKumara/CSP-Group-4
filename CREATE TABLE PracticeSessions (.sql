CREATE TABLE PracticeSessions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DayOfWeek NVARCHAR(20) NOT NULL,
    StartTime NVARCHAR(20) NOT NULL,
    EndTime NVARCHAR(20) NOT NULL,
    SessionType NVARCHAR(100) NOT NULL
);

INSERT INTO PracticeSessions (DayOfWeek, StartTime, EndTime, SessionType)
VALUES 
('Wednesday', '3:00 PM', '6:30 PM', 'Team Practice'),
('Friday', '3:00 PM', '5:30 PM', 'Beginners Practice'),
('Saturday', '8:30 AM', '11:30 AM', 'Team Practice');