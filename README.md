# SLIIT Tennis Management System

**Group:** Group 04
**Module:** SE3022 Case Study Project (Year 3 Semester 1)

---

## Tech Stack

This project strictly adheres to the SE3022 Technical Implementation requirements

**Frontend:** React.js
**Backend:** ASP.NET Core Web API
**Database Access:** ADO.NET (Direct SQL, No ORMs)
**Database:** MySQL
**CI/CD & Version Control:** GitHub Actions, Git
**Deployment:** Docker / Azure App Service
**Testing:** Selenium (E2E), JMeter (Load), NUnit/xUnit (Unit)

---

## Core Modules & Features

The system is divided into four primary domains, featuring Role-Based Access Control (RBAC) for Admins (Captains/Vice-Captains), Players, and Visitors:

1.  **Player & Attendance Management:** Track weekly practice sessions, log player attendance, and generate fitness reports.
2.  **Tournament & Live Scoring:** Create tournament brackets, update live match scores, and generate automated leaderboards.
3.  **Equipment & Inventory Control:** Manage communal club gear, track equipment condition, and calculate financial loss for damaged items.
4.  **System Administration & QA Dashboard:** Manage user accounts, assign roles, and view live CI/CD and code coverage metrics.

---

## Prerequisites

Ensure you have the following installed on your local machine before setting up the project:

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0+)
* Git

---

## Local Setup Instructions

### 1. Database Configuration
1. Open MySQL Workbench or your preferred database client.
2. Execute the database creation script located at `/database/schema.sql` to generate the tables.
3. (Optional) Execute `/database/seed_data.sql` to populate the database with mock users and equipment for testing.

### 2. Backend Setup (ASP.NET)
1. Navigate to the backend directory:
   ```bash
   cd backend
2. Restore the .NET dependencies:
   `dotnet restore`
3. Update the database connection string. Open appsettings.json (or appsettings.Development.json) and configure your MySQL credentials:
   `"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=SliitTennisDB;User=root;Password=YOUR_PASSWORD;"
}`
4. Run the API:
   `dotnet run` 
The Swagger API documentation will be available at http://localhost:<port>/swagger.

### 3. Frontend Setup (React.js)
1. Open a new terminal and navigate to the frontend directory:
   `cd frontend`
2. Install the Node modules:
   `npm install`
3. Create a .env file in the root of the /frontend directory and define the backend API URL:
   `REACT_APP_API_URL=http://localhost:<backend-port>/api`
4. Start the React development server:
   `npm start`
