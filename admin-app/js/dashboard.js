import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const users = await dbApi.select('users');
    const sliders = await dbApi.select('slider_images', { is_enabled: true });
    const videos = await dbApi.select('popup_video', { is_enabled: true });

    const pending = users.filter(u => u.status === 'pending').length;
    const completed = users.filter(u => u.status === 'completed').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogins = users.filter(u => u.last_login && u.last_login.startsWith(todayStr)).length;

    let latestLoginTime = 'N/A';
    if (users.length > 0) {
        const sorted = [...users].sort((a, b) => new Date(b.last_login) - new Date(a.last_login));
        latestLoginTime = sharedUtils.formatTime(sorted[0].last_login);
    }

    // Populate 7 Cards
    const elTotal = document.getElementById('stat-total-users');
    const elPending = document.getElementById('stat-pending-users');
    const elCompleted = document.getElementById('stat-completed-users');
    const elToday = document.getElementById('stat-today-login');
    const elLatest = document.getElementById('stat-latest-login');
    const elSlider = document.getElementById('stat-slider-count');
    const elVideo = document.getElementById('stat-video-count');

    if (elTotal) elTotal.innerText = users.length;
    if (elPending) elPending.innerText = pending;
    if (elCompleted) elCompleted.innerText = completed;
    if (elToday) elToday.innerText = todayLogins;
    if (elLatest) elLatest.innerText = latestLoginTime;
    if (elSlider) elSlider.innerText = sliders.length;
    if (elVideo) elVideo.innerText = videos.length;

    // Populate Recent Logins Table
    const recentTbody = document.getElementById('recent-logins-tbody');
    if (recentTbody) {
        const recentUsers = [...users].sort((a, b) => new Date(b.last_login) - new Date(a.last_login)).slice(0, 5);
        recentTbody.innerHTML = recentUsers.map(u => `
            <tr>
                <td><strong>+91 ${u.mobile}</strong></td>
                <td><span class="status-badge status-${u.status}">${u.status.toUpperCase()}</span></td>
                <td><strong>${u.login_count}</strong></td>
                <td>${sharedUtils.formatDate(u.last_login)} ${sharedUtils.formatTime(u.last_login)}</td>
            </tr>
        `).join('');
    }

    // Initialize Chart.js Graphs
    if (window.Chart) {
        // Daily Login Graph
        const ctxDaily = document.getElementById('chart-daily-login');
        if (ctxDaily) {
            new Chart(ctxDaily, {
                type: 'line',
                data: {
                    labels: ['5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
                    datasets: [{
                        label: 'Logins',
                        data: [12, 19, 14, 25, 22, todayLogins || 30],
                        borderColor: '#0084ff',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(0, 132, 255, 0.1)'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // Pending vs Completed Pie Chart
        const ctxStatus = document.getElementById('chart-status');
        if (ctxStatus) {
            new Chart(ctxStatus, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                        data: [completed || 1, pending || 1],
                        backgroundColor: ['#10b981', '#f59e0b']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // User Activity Bar Chart
        const ctxActivity = document.getElementById('chart-activity');
        if (ctxActivity) {
            new Chart(ctxActivity, {
                type: 'bar',
                data: {
                    labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
                    datasets: [{
                        label: 'Active Users',
                        data: [15, 35, 45, 20],
                        backgroundColor: '#6366f1'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }
});
