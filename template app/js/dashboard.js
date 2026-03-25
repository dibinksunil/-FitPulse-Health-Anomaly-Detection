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

    let chartInstances = {};

    async function loadDashboard() {
        try {
            const data = await api.getDashboardMetrics();
            
            const profileName = data.user.profile?.fullName || user.username;
            document.getElementById('kpi-name').innerText = profileName;
            
            document.getElementById('kpi-hr').innerText = data.metrics.heartRate;
            document.getElementById('kpi-steps').innerText = data.metrics.steps !== '--' ? Number(data.metrics.steps).toLocaleString() : '--';
            document.getElementById('kpi-sleep').innerText = data.metrics.sleep;
            document.getElementById('kpi-cal').innerText = data.metrics.calories !== '--' ? Number(data.metrics.calories).toLocaleString() : '--';

            updateHealthAlert(data.metrics);
            renderCharts(data.chartData);
            renderTable(data.logs);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            if (error.message === 'Not authenticated') api.logout();
        }
    }

    function updateHealthAlert(latestMetrics) {
        if (latestMetrics.heartRate === '--') return;
        
        const hr = Number(latestMetrics.heartRate);
        const sleep = Number(latestMetrics.sleep);
        
        const alertContent = document.getElementById('health-alert-content');
        
        if (hr > 120 || hr < 50 || sleep < 4) {
            alertContent.style.borderColor = '#ef4444';
            alertContent.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            alertContent.innerHTML = `
                <h4 style="color: #ef4444">ATTENTION NEEDED</h4>
                <p>Some vitals are outside optimal ranges.</p>
            `;
        } else {
            alertContent.style.borderColor = '#4ade80';
            alertContent.style.backgroundColor = 'rgba(74, 222, 128, 0.05)';
            alertContent.innerHTML = `
                <h4 style="color: #4ade80">GREAT HEALTH DAY!</h4>
                <p>All metrics within optimal range.</p>
            `;
        }
    }

    window.deleteLogEntry = async function(logId) {
        if (!confirm('Delete this entry?')) return;
        try {
            await api.deleteLog(logId);
            loadDashboard(); // Refresh
        } catch(e) {
            alert('Error deleting: ' + e.message);
        }
    }

    function renderTable(logs) {
        const tbody = document.getElementById('entries-tbody');
        tbody.innerHTML = '';
        
        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--muted-foreground)">No entries found. Log an activity to see it here.</td></tr>`;
            return;
        }

        logs.forEach(log => {
            const hr = Number(log.heartRate);
            const status = (hr < 50 || hr > 120 || Number(log.sleep) < 4) ? 'Warning' : 'Normal';
            const badgeClass = status === 'Normal' ? '' : 'warning';
            
            const tr = document.createElement('tr');
            
            const dateObj = new Date(log.date);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

            tr.innerHTML = `
                <td class="td-muted">${dateStr}</td>
                <td>${log.heartRate} <span class="td-muted">bpm</span></td>
                <td>${Number(log.steps).toLocaleString()}</td>
                <td>${log.sleep}h</td>
                <td>${log.calories} <span class="td-muted">kcal</span></td>
                <td><span class="status-badge ${badgeClass}">${status}</span></td>
                <td style="text-align: right;">
                    <button class="btn-delete" onclick="deleteLogEntry(${log.id})" title="Delete Entry">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderCharts(chartData) {
        const commonOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } } }
            }
        };

        const createChart = (id, type, config) => {
            const ctx = document.getElementById(id).getContext('2d');
            if (chartInstances[id]) chartInstances[id].destroy();
            chartInstances[id] = new Chart(ctx, { type, data: config.data, options: { ...commonOptions, ...config.options } });
        };

        // 1. HR Trend
        createChart('chartHrTrend', 'line', {
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.hr,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2, pointBackgroundColor: '#ef4444', 
                    fill: true, tension: 0.1
                }]
            }
        });

        // 2. Steps Bar
        createChart('chartStepsBar', 'bar', {
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.steps,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            }
        });

        // 3. Calories & Sleep Mix
        createChart('chartCalSleep', 'line', {
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Calories',
                        data: chartData.calories,
                        borderColor: '#f59e0b', // Orange
                        borderWidth: 2, tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Sleep',
                        data: chartData.sleep,
                        borderColor: '#8b5cf6', // Purple
                        borderWidth: 2, tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                scales: {
                    y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: {color: '#f59e0b'} },
                    y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: {color: '#8b5cf6'} },
                    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } }
                }
            }
        });
    }

    loadDashboard();
});
