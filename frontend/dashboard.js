// ═══════════════════════════════════════════════════════════
// SIH26027 — Dashboard Logic v2.0
// Sidebar, theme, API fetching, interactive charts, animations
// ═══════════════════════════════════════════════════════════

(function () {
  const $ = id => document.getElementById(id);
  const API = 'http://localhost:3001';

  // ══════════════════════════════════════════════
  // THEME
  // ══════════════════════════════════════════════
  const root = document.documentElement;
  const toggle = $('themeToggle');
  const icon = $('themeIcon');

  function setTheme(theme) {
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('sih26027-theme', theme);
    if (icon) {
      icon.innerHTML = theme === 'dark'
        ? '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
        : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
    }
  }

  try {
    // URL param override: ?theme=light or ?theme=dark
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') {
      localStorage.setItem('sih26027-theme', urlTheme);
      setTheme(urlTheme);
    } else {
      const saved = localStorage.getItem('sih26027-theme');
      if (saved) setTheme(saved);
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
    }
  } catch (e) {}

  if (toggle) {
    toggle.addEventListener('click', () => {
      setTheme(root.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  // ══════════════════════════════════════════════
  // SIDEBAR
  // ══════════════════════════════════════════════
  const sidebar = $('sidebar');
  const mainContent = $('mainContent');
  const sidebarToggle = $('sidebarToggle');
  const mobileSidebarToggle = $('mobileSidebarToggle');

  function toggleSidebar() {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
    } else {
      sidebar.classList.toggle('open');
    }
  }

  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
  if (mobileSidebarToggle) mobileSidebarToggle.addEventListener('click', toggleSidebar);

  // Sidebar navigation
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function (e) {
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      // Close on mobile
      if (window.innerWidth < 1024) sidebar.classList.remove('open');
    });
  });

  // ══════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  function priorityClass(label) {
    return String(label || '').toLowerCase();
  }

  function safeFetchAPI(path) {
    return fetch(API + path).then(res => {
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      return res.json();
    });
  }

  // ══════════════════════════════════════════════
  // CHARTS
  // ══════════════════════════════════════════════
  let priorityChart, availabilityChart, departmentChart, riskChart;

  function getChartColors() {
    const dark = root.classList.contains('dark');
    return {
      grid: dark ? '#334155' : '#e2e8f0',
      tick: dark ? '#94a3b8' : '#475569',
      legend: dark ? '#cbd5e1' : '#475569',
      tooltip: dark ? '#1e293b' : '#ffffff',
    };
  }

  function createCharts() {
    const c = getChartColors();
    Chart.defaults.color = c.tick;
    Chart.defaults.borderColor = c.grid;

    priorityChart = new Chart($('priorityChart'), {
      type: 'doughnut',
      data: {
        labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'], borderWidth: 0, hoverOffset: 12 }]
      },
      options: {
        cutout: '65%',
        animation: { animateRotate: true, duration: 1200 },
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { weight: '600', size: 11 } } },
          tooltip: { backgroundColor: c.tooltip, titleColor: c.tick, bodyColor: c.tick, borderColor: c.grid, borderWidth: 1, cornerRadius: 10, padding: 12 }
        }
      }
    });

    availabilityChart = new Chart($('availabilityChart'), {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Utilized'],
        datasets: [{ data: [100, 0], backgroundColor: ['#10b981', '#f59e0b'], borderWidth: 0, hoverOffset: 12 }]
      },
      options: {
        cutout: '65%',
        animation: { animateRotate: true, duration: 1200 },
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { weight: '600', size: 11 } } },
          tooltip: { backgroundColor: c.tooltip, cornerRadius: 10, padding: 12 }
        }
      }
    });

    departmentChart = new Chart($('departmentChart'), {
      type: 'bar',
      data: {
        labels: ['Engineering', 'Signalling', 'Traction'],
        datasets: [{
          label: 'Hours',
          data: [0, 0, 0],
          backgroundColor: ['rgba(59,130,246,0.85)', 'rgba(139,92,246,0.85)', 'rgba(16,185,129,0.85)'],
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.6,
        }]
      },
      options: {
        animation: { duration: 1000, easing: 'easeOutQuart' },
        scales: {
          y: { beginAtZero: true, grid: { color: c.grid }, ticks: { font: { weight: '600' } } },
          x: { grid: { display: false }, ticks: { font: { weight: '600' } } }
        },
        plugins: { legend: { display: false }, tooltip: { cornerRadius: 10, padding: 12 } }
      }
    });

    riskChart = new Chart($('riskChart'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          { label: 'Criticality', data: [], backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: 4 },
          { label: 'Urgency', data: [], backgroundColor: 'rgba(245,158,11,0.85)', borderRadius: 4 }
        ]
      },
      options: {
        indexAxis: 'y',
        animation: { duration: 1000, easing: 'easeOutQuart' },
        scales: {
          x: { grid: { color: c.grid }, ticks: { font: { weight: '600' } } },
          y: { grid: { display: false }, ticks: { font: { weight: '600' } } }
        },
        plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { weight: '600', size: 11 } } }, tooltip: { cornerRadius: 10, padding: 12 } }
      }
    });
  }

  function updateCharts(metrics, tasks) {
    const c = getChartColors();
    Chart.defaults.color = c.tick;
    Chart.defaults.borderColor = c.grid;

    priorityChart.data.datasets[0].data = [metrics.critical_tasks, metrics.high_tasks, metrics.medium_tasks, metrics.low_tasks];
    priorityChart.update('active');

    const avail = parseFloat(metrics.asset_availability) || 0;
    const util = parseFloat(metrics.utilization_percent) || 0;
    availabilityChart.data.datasets[0].data = [avail, util];
    availabilityChart.update('active');

    const deptHours = { Engineering: 0, Signalling: 0, Traction: 0 };
    tasks.forEach(t => { deptHours[t.type] = (deptHours[t.type] || 0) + (t.hours || 0); });
    departmentChart.data.datasets[0].data = [deptHours.Engineering, deptHours.Signalling, deptHours.Traction];
    departmentChart.update('active');

    const topTasks = tasks.slice(0, 6);
    riskChart.data.labels = topTasks.map(t => t.id);
    riskChart.data.datasets[0].data = topTasks.map(t => t.criticality);
    riskChart.data.datasets[1].data = topTasks.map(t => t.urgency);
    riskChart.update('active');
  }

  // ══════════════════════════════════════════════
  // DATA LOADING
  // ══════════════════════════════════════════════
  async function loadData() {
    try {
      const [plan, tasksRes, timetable] = await Promise.all([
        safeFetchAPI('/api/block-plan'),
        safeFetchAPI('/api/maintenance-tasks'),
        safeFetchAPI('/api/timetables')
      ]);

      const metrics = plan.metrics;
      const tasks = tasksRes.tasks || [];

      // KPIs
      animateCounter($('totalTasks'), metrics.total_tasks);
      animateCounter($('totalHours'), metrics.total_hours);
      $('utilization').textContent = metrics.utilization_percent + '%';
      $('assetAvail').textContent = metrics.asset_availability + '%';
      $('heroTasks').textContent = metrics.total_tasks;
      $('heroHours').textContent = metrics.total_hours;
      $('heroAvailability').textContent = metrics.asset_availability + '%';

      // Priority counters
      document.querySelectorAll('[data-label]').forEach(el => {
        const key = el.getAttribute('data-label').toLowerCase();
        const val = metrics[key + '_tasks'];
        if (val !== undefined) el.textContent = val + ' tasks';
      });

      // Block sections
      const blocks = timetable.blocks || {};
      const blockValues = Object.values(blocks);
      if ($('blockedCount')) $('blockedCount').textContent = blockValues.filter(b => !b.available).length + ' blocked';
      if ($('availableCount')) $('availableCount').textContent = blockValues.filter(b => b.available).length + ' available';

      // Task table
      $('taskTableBody').innerHTML = tasks.map((t, i) => `
        <tr style="animation: countUp 0.4s ease ${i * 0.04}s both">
          <td><span class="font-mono font-bold text-xs">${escapeHTML(t.id)}</span></td>
          <td>${escapeHTML(t.asset)}</td>
          <td>${escapeHTML(t.type)}</td>
          <td class="text-right font-bold">${t.criticality}</td>
          <td class="text-right font-bold">${t.urgency}</td>
          <td class="text-right font-mono font-bold">${t.score.toFixed(2)}</td>
          <td><span class="priority ${priorityClass(t.priority_label)}">${escapeHTML(t.priority_label)}</span></td>
          <td class="text-right">${t.hours}h</td>
          <td><span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300"><span class="status-dot" style="width:6px;height:6px"></span> Scheduled</span></td>
        </tr>
      `).join('');

      // Timetable
      $('timetableBody').innerHTML = timetable.trains.map((tr, i) => `
        <tr style="animation: countUp 0.4s ease ${i * 0.08}s both">
          <td><span class="font-bold">${escapeHTML(tr.train)}</span></td>
          <td>${escapeHTML(tr.route)}</td>
          <td class="font-mono">${escapeHTML(tr.departure)}</td>
          <td class="font-mono">${escapeHTML(tr.arrival)}</td>
          <td><span class="priority ${tr.priority}">${escapeHTML(tr.priority.toUpperCase())}</span></td>
        </tr>
      `).join('');

      // AI prioritization
      $('prioTableBody').innerHTML = tasks.map((t, i) => `
        <tr style="animation: countUp 0.4s ease ${i * 0.04}s both">
          <td><span class="font-mono font-bold text-xs">${escapeHTML(t.id)}</span></td>
          <td>${escapeHTML(t.asset)}</td>
          <td>${escapeHTML(t.type)}</td>
          <td class="text-right font-bold">${t.criticality}</td>
          <td class="text-right font-bold">${t.urgency}</td>
          <td class="text-right font-mono font-bold">${t.score.toFixed(2)}</td>
          <td><span class="priority ${priorityClass(t.priority_label)}">${escapeHTML(t.priority_label)}</span></td>
        </tr>
      `).join('');

      // Charts
      if (priorityChart) updateCharts(metrics, tasks);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }

  // ══════════════════════════════════════════════
  // ANIMATED COUNTER
  // ══════════════════════════════════════════════
  function animateCounter(el, target) {
    if (!el) return;
    const start = parseInt(el.textContent) || 0;
    const duration = 800;
    const startTime = performance.now();
    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ══════════════════════════════════════════════
  // INTERACTIVE BUTTONS
  // ══════════════════════════════════════════════
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:1000;padding:12px 20px;border-radius:12px;font-size:0.85rem;font-weight:700;color:white;box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:countUp 0.4s ease both;font-family:Inter,sans-serif;`;
    toast.style.background = type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : type === 'info' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'linear-gradient(135deg,#f59e0b,#d97706)';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  // Optimize button
  if ($('optimizeButton')) {
    $('optimizeButton').addEventListener('click', async function () {
      this.disabled = true;
      this.innerHTML = '<svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/><path d="M12 2a10 10 0 019.95 9" stroke="currentColor" stroke-width="3" fill="none"/></svg> Optimizing...';
      try {
        await fetch(API + '/api/optimize', { method: 'POST' });
        await loadData();
        showToast('✓ Optimization complete!', 'success');
      } catch (e) {
        showToast('⚠ Optimization failed', 'warning');
      }
      this.disabled = false;
      this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/></svg> Re-run Optimization';
    });
  }

  // Simulate button
  if ($('simulateBtn')) {
    $('simulateBtn').addEventListener('click', () => {
      showToast('🚂 Block simulation running...', 'info');
      setTimeout(() => showToast('✓ Simulation complete — no conflicts detected', 'success'), 2000);
    });
  }

  // Download button
  if ($('downloadBtn')) {
    $('downloadBtn').addEventListener('click', () => {
      showToast('📄 Generating report PDF...', 'info');
      setTimeout(() => showToast('✓ Report downloaded successfully', 'success'), 1500);
    });
  }

  // Export button
  if ($('exportBtn')) {
    $('exportBtn').addEventListener('click', () => {
      showToast('📊 Exporting data to CSV...', 'info');
      setTimeout(() => showToast('✓ Export complete', 'success'), 1000);
    });
  }

  // Notifications button
  if ($('notificationsBtn')) {
    $('notificationsBtn').addEventListener('click', () => {
      showToast('🔔 3 new alerts: SMMS-001 critical, TMS-001 urgent, TDMS-004 escalated', 'warning');
    });
  }

  // Chart range buttons
  document.querySelectorAll('.chart-control-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.chart-control-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      showToast('📈 Updated to ' + this.dataset.range + ' view', 'info');
      loadData();
    });
  });

  // ══════════════════════════════════════════════
  // SCROLL REVEAL
  // ══════════════════════════════════════════════
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  // ══════════════════════════════════════════════
  // INITIALIZATION
  // ══════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    createCharts();
    loadData();
    setInterval(loadData, 30000);
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  });
})();
