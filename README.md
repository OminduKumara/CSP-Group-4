# SLIIT Tennis Management System

**Group:** Group 04\
**Module:** SE3022 Case Study Project (Year 3 Semester 1)\
**Members:**\
   IT23750210 - K.H.G.A.Udaneth\
   IT23575776 - M.S.A.O.Kumara\
   IT23645684 - V.N.Jayasinghe\
   IT23575608 - H.W.Ranwala

---

## Tech Stack

This project strictly adheres to the SE3022 Technical Implementation requirements

**Frontend:** React.js (Vite)\
**Backend:** ASP.NET Core Web API (.NET 10.0)\
**Database Access:** ADO.NET (Direct SQL, No ORMs)\
**Database:** Azure SQL / Microsoft SQL Server\
**CI/CD & Version Control:** GitHub Actions, Git\
**Deployment:** Vercel (Frontend) / Azure App Service (Backend)\
**Testing:** Postman (Integration), k6 (Load), NUnit/xUnit (Unit)

---

## Core Modules & Features

The system is divided into four primary domains, featuring Role-Based Access Control (RBAC) for Admins (Captains/Vice-Captains), Players, and Visitors:

1.  **Player & Attendance Management:** Track weekly practice sessions, log player attendance, and generate fitness reports.
2.  **Tournament & Live Scoring:** Create tournament brackets, update live match scores, and generate automated leaderboards.
3.  **Equipment & Inventory Control:** Manage communal club gear, track equipment condition, and calculate financial loss for damaged items.
4.  **System Administration & QA Dashboard:** Manage user accounts, assign roles, and view live CI/CD, system health, and SLA uptime metrics.

---

## Prerequisites

Ensure you have the following installed on your local machine before setting up the project:

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [.NET SDK](https://dotnet.microsoft.com/download)
* SQL Server Management Studio (SSMS) or Azure Data Studio
* [k6](https://k6.io/docs/get-started/installation/) (For local load testing)
* Git

---

## Local Setup Instructions

### 1. Database Configuration
1. Open your preferred SQL Server client and connect to your local or Azure database.
2. The database schema and tables will be automatically initialized by the backend via the `InitializeDatabaseAsync` method in `Program.cs` upon first run.
3. (Optional) Execute any custom seed scripts via your SQL client to populate mock data.

### 2. Backend Setup (ASP.NET)
1. Navigate to the backend directory:
   ```bash
   cd server/tmsserver
   ```
   
2. Restore the .NET dependencies:
   ```bash
   dotnet restore
   ```
   
3. Create a .env file in the server/tmsserver directory and configure your Azure SQL connection string:

AZURE_SQL_CONNECTIONSTRING="Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=SliitTennisDB;Persist Security Info=False;User ID=YOUR_USER;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

4. Run the API:
   ```bash
   dotnet run
   ```
The Swagger API documentation will be available at http://localhost:5011/scalar/v1 or /swagger.

### 3. Frontend Setup (React.js)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client/tmsclient
   ```
   
2. Install the Node modules:
   ```bash
   npm install
   ```

3. Ensure the API endpoints in your src/config/api.js (or .env) point to the running backend (http://localhost:5011/api).

4. Start the React development server:
   ```bash
   npm run dev
   ```

---

## Testing
* Automated API Tests (Postman): Import the TMS Automated Tests collection into Postman to validate the core login and profile update user journeys.

* Load Testing (k6): Ensure the backend is running locally. Open a new terminal, navigate to the load testing directory, and execute the spike test:
   ```bash
   cd server/tmsserver/tests/LoadTests
   k6 run attendance-test.js
   ```

---

## Git Branching Strategy
To maintain a clean and stable repository, all team members must follow this strict branching workflow:
* main: Production-ready code only. Do not commit directly to this branch.
* develop: The primary integration branch.
* SCRUM-XX / feature: Create branches off develop using the Jira ticket format for new user stories (e.g., SCRUM-68-Production-Deployment).
* testing: For fixing issues found during QA.

Pull Request Process: All code merged into develop or main requires a Pull Request (PR). GitHub Actions will automatically run the build and integration steps. The PR must pass all checks and be reviewed by at least one other team member before merging. Resolve any bin/obj merge conflicts locally before pushing.
