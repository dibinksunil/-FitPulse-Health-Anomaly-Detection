const db = require('./db');

db.serialize(() => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Create Metrics table
    db.run(`CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT,
        heart_rate INTEGER,
        calories INTEGER,
        steps INTEGER,
        sleep REAL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating metrics table:', err);
        } else {
            console.log('Database tables initialized successfully.');
            // Insert seed data if empty
            db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
                if (row.count === 0) {
                    db.run(`INSERT INTO users (username, password) VALUES ('login', 'login')`);
                    console.log('Seed user inserted: login / login');
                }
            });
        }
    });
});

// We don't close the db here because server.js might use it later, 
// or if we just run this script directly we could close it.
// If run directly:
if (require.main === module) {
    setTimeout(() => {
        db.close();
        console.log('Initialization script completed.');
    }, 1000);
}
