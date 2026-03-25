
# -FitPulse-Health-Anomaly-Detection
# FitPulse

FitPulse is an intelligent health companion web application designed to help users track and monitor their daily physical well-being. By recording heart rate, calories burned, step count, and sleep duration, FitPulse simplifies personal health management with visual charts and detailed logs.

## Features

- **User Authentication**: Securely register and log in to a personalized dashboard.
- **Health Tracking**: Submit details about daily physical metrics (heart rate, calories, steps, and sleep).
- **Interactive Dashboard**: Visualize your health data logs over the last 7 entries with intuitive charts.
- **Activity Log Management**: Comprehensive overview of previous logs with options to manage and delete entries.
- **Profile Updates**: Easily modify personal and profile details.
- **REST API backend**: Node.js/Express.js backend structured to manage data safely using JSON file storage.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js (or custom chart integration)
- **Backend**: Node.js, Express.js
- **Database**: Local JSON Storage (`server/fitpulse_db.json`)
- **Other Dependencies**: `cors` (Cross-Origin Resource Sharing), `puppeteer` (for potential testing/scraping)

## Prerequisites

- [Node.js](https://nodejs.org/) (Ensure NPM is also installed)

## Getting Started

Follow the instructions below to set up and run the web app on your local machine.

### 1. Installation

Clone or download the repository to your local computer, open a terminal in the root directory (where `package.json` is located), and install the required dependencies:

```bash
npm install
```

### 2. Running the Application

For Windows environments, start both the backend server and frontend development server simply by running the provided `.bat` file:

```cmd
start.bat
```

> **What `start.bat` actually does:**
> - Starts the backend server explicitly on port `3000` via `node server/server.js`.
> - Fires up the frontend files on port `5500` utilizing the `serve` module available through `npx serve -l 5500`.

### 3. Usage

After the batch file successfully opens your servers:
1. Navigate your web browser to [http://localhost:5500](http://localhost:5500)
2. Use the **Register** tab to create a new user account.
3. Alternatively, you can use the default demo credentials (if registered in your JSON DB):
   - **Username**: login
   - **Password**: login

## Project Structure

- `server/` - Backend Node/Express.js API server, initialization script, and local JSON database implementation.
- `css/` - Styling instructions governing layout and UI presentation.
- `js/` - Interactive components managing fetch requests (`api.js`) and UI flow control (`auth.js`).
- `*.html` - Views for each unique page: Landing, Dashboard, Log Activity, Profile, etc.
- `package.json` - Node dependencies and metadata.
- `start.bat` - Execution script specifically designed to kick off both frontend and backend instantly.
- `scrape.js` - A script designed likely for server-side testing/crawling functionalities via Puppeteer.

## License

This project is licensed under the ISC License.
