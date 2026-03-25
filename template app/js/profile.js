document.addEventListener('DOMContentLoaded', async () => {
    if (!api.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => api.logout());

    const userStr = localStorage.getItem('fitpulse_user');
    const user = JSON.parse(userStr);
    
    // Initial UI Population for Sidebar/Banner
    document.getElementById('sidebar-name').innerText = user.username;
    document.getElementById('sidebar-avatar').innerText = user.username.charAt(0).toUpperCase();
    document.getElementById('banner-name').innerText = user.username;
    document.getElementById('banner-subtitle').innerText = `@${user.username} • Member`;
    document.getElementById('banner-avatar').innerText = user.username.charAt(0).toUpperCase();

    // Elements
    const form = document.getElementById('profile-form');
    const fName = document.getElementById('prof-name');
    const fAge = document.getElementById('prof-age');
    const fGender = document.getElementById('prof-gender');
    const fHeight = document.getElementById('prof-height');
    const fWeight = document.getElementById('prof-weight');
    const fActivity = document.getElementById('prof-activity');

    async function loadProfile() {
        try {
            const data = await api.getDashboardMetrics(); // this now includes profile and logs
            
            // Populate form
            const p = data.user.profile || {};
            fName.value = p.fullName || user.username;
            fAge.value = p.age || '';
            fGender.value = p.gender || '';
            fHeight.value = p.height || '';
            fWeight.value = p.weight || '';
            fActivity.value = p.activityLevel || 'Moderately active';

            // Also update banner if full name exists
            if (p.fullName) {
                document.getElementById('banner-name').innerText = p.fullName;
                document.getElementById('banner-avatar').innerText = p.fullName.charAt(0).toUpperCase();
            }

            // Populate Stats
            const logs = data.logs || [];
            document.getElementById('banner-entries').innerText = logs.length;

            if (logs.length > 0) {
                const sumHr = logs.reduce((a, b) => a + Number(b.heartRate), 0);
                const sumSteps = logs.reduce((a, b) => a + Number(b.steps), 0);
                const sumSleep = logs.reduce((a, b) => a + Number(b.sleep), 0);
                const sumCal = logs.reduce((a, b) => a + Number(b.calories), 0);
                
                document.getElementById('avg-hr').innerText = Math.round(sumHr / logs.length);
                document.getElementById('avg-steps').innerText = Math.round(sumSteps / logs.length).toLocaleString();
                document.getElementById('avg-sleep').innerText = (sumSleep / logs.length).toFixed(1);
                document.getElementById('avg-cal').innerText = Math.round(sumCal / logs.length).toLocaleString();
            }

            // Populate Recent Activity List (max 3 items)
            const list = document.getElementById('activity-list');
            list.innerHTML = '';
            logs.slice(0, 3).forEach(log => {
                const dateObj = new Date(log.date);
                const str = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                const li = document.createElement('div');
                li.className = 'activity-item';
                li.innerHTML = `
                    <div class="act-left">
                        <div class="act-dot"></div>
                        <div>
                            <span class="act-time">${str}</span>
                            <span class="act-desc">${Number(log.steps).toLocaleString()} steps • ${log.sleep}h sleep</span>
                        </div>
                    </div>
                    <div class="act-right">${log.heartRate} bpm</div>
                `;
                list.appendChild(li);
            });

            if(logs.length === 0) {
                list.innerHTML = '<p style="color:var(--muted-foreground);text-align:center;">No recent activity</p>';
            }

        } catch (error) {
            console.error('Failed to load profile', error);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-prof-btn');
        btn.innerText = 'Saving...';
        try {
            await api.updateProfile({
                fullName: fName.value,
                age: fAge.value,
                gender: fGender.value,
                height: fHeight.value,
                weight: fWeight.value,
                activityLevel: fActivity.value
            });
            btn.innerText = 'Saved!';
            setTimeout(() => btn.innerHTML = 'Save Profile &rarr;', 2000);
            loadProfile(); // Refresh UI
        } catch (err) {
            alert('Failed to save profile: ' + err.message);
            btn.innerHTML = 'Save Profile &rarr;';
        }
    });

    // Export Data
    document.getElementById('download-csv-btn').addEventListener('click', async () => {
        try {
            const btn = document.getElementById('download-csv-btn');
            const originalText = btn.innerText;
            btn.innerText = 'Exporting...';
            
            const data = await api.getDashboardMetrics();
            const logs = data.logs || [];
            if (logs.length === 0) {
                alert('No activity data to export.');
                btn.innerText = originalText;
                return;
            }
            
            const headers = ['Date', 'Heart Rate (bpm)', 'Steps', 'Sleep (h)', 'Calories (kcal)'];
            const rows = logs.map(log => [
                new Date(log.date).toLocaleString(),
                log.heartRate || 0,
                log.steps || 0,
                log.sleep || 0,
                log.calories || 0
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(v => `"${v}"`).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'fitpulse_activity.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            btn.innerText = originalText;
        } catch (error) {
            console.error('Failed to export CSV', error);
            alert('Failed to export CSV.');
            document.getElementById('download-csv-btn').innerText = 'Download CSV';
        }
    });

    document.getElementById('download-excel-btn').addEventListener('click', async () => {
        try {
            const btn = document.getElementById('download-excel-btn');
            const originalText = btn.innerText;
            btn.innerText = 'Exporting...';
            
            const data = await api.getDashboardMetrics();
            const logs = data.logs || [];
            if (logs.length === 0) {
                alert('No activity data to export.');
                btn.innerText = originalText;
                return;
            }
            
            let tableHTML = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Activity Log</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="1"><tr><th>Date</th><th>Heart Rate (bpm)</th><th>Steps</th><th>Sleep (h)</th><th>Calories (kcal)</th></tr>';
            logs.forEach(log => {
                tableHTML += `<tr>
                    <td>${new Date(log.date).toLocaleString()}</td>
                    <td>${log.heartRate || 0}</td>
                    <td>${log.steps || 0}</td>
                    <td>${log.sleep || 0}</td>
                    <td>${log.calories || 0}</td>
                </tr>`;
            });
            tableHTML += '</table></body></html>';
            
            const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'fitpulse_activity.xls');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            btn.innerText = originalText;
        } catch (error) {
            console.error('Failed to export Excel', error);
            alert('Failed to export Excel.');
            document.getElementById('download-excel-btn').innerText = 'Download Excel';
        }
    });

    loadProfile();
});
