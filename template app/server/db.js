const fs = require('fs/promises');
const path = require('path');

const dbPath = path.resolve(__dirname, 'fitpulse_db.json');

class JSONDatabase {
    constructor() {
        this.data = { users: [], logs: [] };
        this.initialized = false;
    }

    async init() {
        try {
            const content = await fs.readFile(dbPath, 'utf8');
            this.data = JSON.parse(content);
        } catch (error) {
            this.data = { 
                users: [{ 
                    id: 1, 
                    username: 'login', 
                    password: 'login',
                    profile: { fullName: 'admin', age: '', gender: '', height: '', weight: '', activityLevel: '' }
                }], // Seed data
                logs: []
            };
            await this.save();
        }
        this.initialized = true;
    }

    async save() {
        await fs.writeFile(dbPath, JSON.stringify(this.data, null, 2));
    }

    async addUser(username, password) {
        if (!this.initialized) await this.init();
        
        if (this.data.users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }

        const newId = this.data.users.length > 0 
            ? Math.max(...this.data.users.map(u => u.id)) + 1 
            : 1;
            
        const newUser = { 
            id: newId, 
            username, 
            password,
            profile: { fullName: username, age: '', gender: '', height: '', weight: '', activityLevel: '' } 
        };
        this.data.users.push(newUser);
        await this.save();
        
        return newUser;
    }

    async getUser(username, password) {
        if (!this.initialized) await this.init();
        return this.data.users.find(u => u.username === username && u.password === password);
    }
    
    async getUserById(id) {
        if (!this.initialized) await this.init();
        // The id might be passed as string from URL params
        return this.data.users.find(u => String(u.id) === String(id));
    }

    async addLog(userId, date, heartRate, calories, steps, sleep) {
        if (!this.initialized) await this.init();
        if (!this.data.logs) this.data.logs = [];

        const logId = this.data.logs.length > 0 
            ? Math.max(...this.data.logs.map(l => l.id)) + 1 
            : 1;

        const newLog = { 
            id: logId, 
            userId: Number(userId), 
            date, 
            heartRate: Number(heartRate), 
            calories: Number(calories), 
            steps: Number(steps), 
            sleep: Number(sleep) 
        };
        
        this.data.logs.push(newLog);
        await this.save();
        return newLog;
    }

    async getLogs(userId) {
        if (!this.initialized) await this.init();
        if (!this.data.logs) this.data.logs = [];
        
        return this.data.logs
            .filter(l => l.userId === Number(userId))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    async deleteLog(userId, logId) {
        if (!this.initialized) await this.init();
        const initialLength = this.data.logs.length;
        this.data.logs = this.data.logs.filter(l => !(l.id === Number(logId) && l.userId === Number(userId)));
        if (this.data.logs.length !== initialLength) {
            await this.save();
            return true;
        }
        return false;
    }

    async updateProfile(userId, profileData) {
        if (!this.initialized) await this.init();
        const user = this.data.users.find(u => u.id === Number(userId));
        if (!user) throw new Error('User not found');
        
        user.profile = { ...user.profile, ...profileData };
        await this.save();
        return user.profile;
    }
}

module.exports = new JSONDatabase();
