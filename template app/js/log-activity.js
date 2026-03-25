document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    if (!api.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => api.logout());

    // Sidebar Data
    const userStr = localStorage.getItem('fitpulse_user');
    const user = JSON.parse(userStr);
    document.getElementById('sidebar-name').innerText = user.username;
    document.getElementById('sidebar-avatar').innerText = user.username.charAt(0).toUpperCase();
    document.getElementById('display-name').value = user.username;

    // Default datetime
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('input-date').value = now.toISOString().slice(0, 16);

    // Slider Logic
    const hrInput = document.getElementById('input-hr');
    const stepsInput = document.getElementById('input-steps');
    const calInput = document.getElementById('input-cal');
    const sleepInput = document.getElementById('input-sleep');

    const hrVal = document.getElementById('val-hr');
    const stepsVal = document.getElementById('val-steps');
    const calVal = document.getElementById('val-cal');
    const sleepVal = document.getElementById('val-sleep');

    function updateStatus() {
        const hr = parseInt(hrInput.value);
        const sleep = parseFloat(sleepInput.value);
        
        let status = 'Normal';
        let desc = 'All vitals within healthy ranges';
        let color = '#4ade80';

        if (hr < 50 || hr > 120 || sleep < 4) {
            status = 'Attention Needed';
            desc = 'Some vitals are outside optimal ranges.';
            color = '#fbbf24'; // Yellow/Orange
        }
        if (hr > 150 || sleep < 2) {
            status = 'Warning';
            desc = 'Critical vital levels detected!';
            color = '#ef4444'; // Red
        }

        const box = document.getElementById('status-box');
        box.style.background = `${color}1A`; // 10% opacity
        box.style.borderColor = `${color}33`; // 20% opacity
        
        const icon = document.querySelector('.health-status-icon');
        icon.style.background = color;
        icon.innerText = status === 'Normal' ? '✓' : '!';

        document.getElementById('status-title').innerText = `Health Status: ${status}`;
        document.getElementById('status-desc').innerText = desc;
    }

    hrInput.addEventListener('input', (e) => {
        hrVal.innerHTML = `${e.target.value} <span class="slider-unit">bpm</span>`;
        updateStatus();
    });
    stepsInput.addEventListener('input', (e) => {
        stepsVal.innerText = Number(e.target.value).toLocaleString();
    });
    calInput.addEventListener('input', (e) => {
        calVal.innerHTML = `${e.target.value} <span class="slider-unit">kcal</span>`;
    });
    sleepInput.addEventListener('input', (e) => {
        sleepVal.innerHTML = `${e.target.value} <span class="slider-unit">hours</span>`;
        updateStatus();
    });

    // Form Submit
    document.getElementById('activity-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-btn');
        btn.innerText = 'Saving...';

        try {
            await api.addLog({
                date: document.getElementById('input-date').value,
                heartRate: hrInput.value,
                calories: calInput.value,
                steps: stepsInput.value,
                sleep: sleepInput.value
            });
            btn.innerText = '✓ Saved Successfully';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (err) {
            btn.innerText = 'Error saving';
            alert(err.message);
            setTimeout(() => { btn.innerText = '↓ Save Health Entry'; }, 2000);
        }
    });
});
