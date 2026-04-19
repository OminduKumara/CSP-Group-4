IF OBJECT_ID('dbo.SystemHealthLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SystemHealthLogs (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Status VARCHAR(50) NOT NULL,
        PingedAt DATETIME NOT NULL DEFAULT GETUTCDATE()
    );
    CREATE INDEX idx_health_pingedat ON dbo.SystemHealthLogs(PingedAt);
    PRINT 'Table SystemHealthLogs created successfully.';
END
ELSE
BEGIN
    PRINT 'Table SystemHealthLogs already exists.';
END;