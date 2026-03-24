-- Tennis Management System - Database Schema with RBAC

CREATE TABLE IF NOT EXISTS Users (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    IdentityNumber VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role TINYINT NOT NULL DEFAULT 4, -- 1=SystemAdmin, 2=Admin, 3=Player, 4=PendingPlayer
    IsApproved BOOLEAN NOT NULL DEFAULT FALSE,
    ApprovedByAdminId INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ApprovedAt DATETIME NULL,
    FOREIGN KEY (ApprovedByAdminId) REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Roles (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE, -- SystemAdmin, Admin, Player, PendingPlayer
    Description VARCHAR(255),
    Permissions JSON,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS UserRoles (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    AssignedBy INT,
    AssignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (UserId, RoleId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE,
    FOREIGN KEY (AssignedBy) REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS RegistrationRequests (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    ReviewedByAdminId INT NULL,
    ReviewedAt DATETIME NULL,
    RejectionReason VARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_registration (UserId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ReviewedByAdminId) REFERENCES Users(Id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Tournaments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    Status TINYINT NOT NULL DEFAULT 0, -- 0=Scheduled, 1=InProgress, 2=Completed, 3=Cancelled
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    CreatedByAdminId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL,
    UpdatedByAdminId INT NULL,
    FOREIGN KEY (CreatedByAdminId) REFERENCES Users(Id) ON DELETE RESTRICT,
    FOREIGN KEY (UpdatedByAdminId) REFERENCES Users(Id) ON DELETE SET NULL,
    INDEX idx_tournaments_status (Status),
    INDEX idx_tournaments_dates (StartDate, EndDate)
);

-- Insert default roles
INSERT INTO Roles (Name, Description, Permissions) VALUES
('SystemAdmin', 'System administrator with full access', JSON_ARRAY('*')),
('Admin', 'Administrator with management access', JSON_ARRAY('manage_users', 'manage_players', 'approve_registrations', 'view_reports')),
('Player', 'Tournament player', JSON_ARRAY('view_tournaments', 'register_tournament', 'view_results')),
('PendingPlayer', 'Player awaiting approval', JSON_ARRAY());

-- Create indexes for better performance
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_username ON Users(Username);
CREATE INDEX idx_users_identity ON Users(IdentityNumber);
CREATE INDEX idx_users_role ON Users(Role);
CREATE INDEX idx_users_approved ON Users(IsApproved);
CREATE INDEX idx_user_roles_user ON UserRoles(UserId);
CREATE INDEX idx_registration_status ON RegistrationRequests(Status);
CREATE INDEX idx_registration_user ON RegistrationRequests(UserId);
