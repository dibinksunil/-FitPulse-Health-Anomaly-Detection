const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize JSON database
db.init().then(() => console.log('JSON Database initialized'));

// --- Routes ---

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const newUser = await db.addUser(username, password);
        res.json({ success: true, message: 'User registered successfully', userId: newUser.id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.getUser(username, password);
        
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Return full user object including profile
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add User Data Log
app.post('/api/logs', async (req, res) => {
    try {
        const { userId, date, heartRate, calories, steps, sleep } = req.body;
        if (!userId || !date) return res.status(400).json({ error: 'Missing required fields' });

        const log = await db.addLog(userId, date, heartRate, calories, steps, sleep);
        res.json({ success: true, log });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Log
app.delete('/api/logs/:userId/:logId', async (req, res) => {
    try {
        const success = await db.deleteLog(req.params.userId, req.params.logId);
        if (success) res.json({ success: true });
        else res.status(404).json({ error: 'Log not found' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Profile
app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await db.getUserById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile
app.put('/api/users/:userId/profile', async (req, res) => {
    try {
        const profile = await db.updateProfile(req.params.userId, req.body);
        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User Dashboard Data (Metrics)
app.get('/api/metrics/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await db.getUserById(userId);
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const logs = await db.getLogs(userId);
        
        // Add id back to logs for deleting on frontend
        const allLogs = logs.map(l => ({ ...l }));

        // Top metrics representation: Use the latest log if available, else zero.
        let hr = 0, cal = 0, steps = 0, sleep = 0;
        if (logs.length > 0) {
            const latest = logs[logs.length - 1]; // sorted by date asc so last is latest
            hr = latest.heartRate;
            cal = latest.calories;
            steps = latest.steps;
            sleep = latest.sleep;
        }

        // Get last 7 logs for the charts
        const last7Logs = logs.slice(-7);
        const chartLabels = last7Logs.map(l => {
            const dt = new Date(l.date);
            return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        });
        
        const hrData = last7Logs.map(l => l.heartRate);
        const calData = last7Logs.map(l => l.calories);
        const stepsData = last7Logs.map(l => l.steps);
        const sleepData = last7Logs.map(l => l.sleep);

        // If no data, provide an empty array (or can fallback to dummy data for aesthetic purposes)
        res.json({
            user: { username: user.username, profile: user.profile },
            metrics: {
                heartRate: hr || '--',
                calories: cal || '--',
                steps: steps || '--',
                sleep: sleep || '--'
            },
            chartData: {
                labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
                hr: hrData.length > 0 ? hrData : [0],
                calories: calData.length > 0 ? calData : [0],
                steps: stepsData.length > 0 ? stepsData : [0],
                sleep: sleepData.length > 0 ? sleepData : [0]
            },
            logs: allLogs.reverse() // send newest first for the table
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`FitPulse Backend API running on http://localhost:${PORT}`);
});
