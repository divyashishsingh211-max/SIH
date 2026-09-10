// SIH26027 — AI-Powered Automatic Block Planning
// Backend API Server (Node.js built-in http module)
// Provides REST endpoints for maintenance data, AI scheduling, and planning views

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// ─── Mock Data ───────────────────────────────────────────────
// Simulates TMS, SMMS, TDMS, and COA data sources

const trackMaintenance = [
  { id: 'TMS-001', asset: 'Track Section A1', type: 'Engineering', defect: 'Rail fracture', criticality: 9, urgency: 8, status: 'pending', hours: 6 },
  { id: 'TMS-002', asset: 'Track Section B2', type: 'Engineering', defect: 'Sleeper degradation', criticality: 6, urgency: 5, status: 'pending', hours: 4 },
  { id: 'TMS-003', asset: 'Track Section C3', type: 'Engineering', defect: 'Ballast washout', criticality: 8, urgency: 7, status: 'pending', hours: 8 },
  { id: 'TMS-004', asset: 'Track Section D4', type: 'Engineering', defect: 'Switch wear', criticality: 5, urgency: 6, status: 'pending', hours: 3 },
  { id: 'TMS-005', asset: 'Track Section E5', type: 'Engineering', defect: 'Gauge deviation', criticality: 7, urgency: 9, status: 'pending', hours: 5 },
];

const signallingMaintenance = [
  { id: 'SMMS-001', asset: 'Signal Box S1', type: 'Signalling', defect: 'Relay failure', criticality: 10, urgency: 9, status: 'pending', hours: 4 },
  { id: 'SMMS-002', asset: 'Signal Box S2', type: 'Signalling', defect: 'Cable fault', criticality: 8, urgency: 7, status: 'pending', hours: 6 },
  { id: 'SMMS-003', asset: 'Signal Box S3', type: 'Signalling', defect: 'Software error', criticality: 7, urgency: 5, status: 'pending', hours: 3 },
  { id: 'SMMS-004', asset: 'Level Crossing LC1', type: 'Signalling', defect: 'Gate actuator fault', criticality: 9, urgency: 8, status: 'pending', hours: 5 },
];

const tractionMaintenance = [
  { id: 'TDMS-001', asset: 'Substation ST1', type: 'Traction', defect: 'Transformer overheating', criticality: 8, urgency: 8, status: 'pending', hours: 7 },
  { id: 'TDMS-002', asset: 'Trolley Pole TP3', type: 'Traction', defect: 'Wire breakage', criticality: 6, urgency: 6, status: 'pending', hours: 4 },
  { id: 'TDMS-003', asset: 'Substation ST2', type: 'Traction', defect: 'Cooling system fault', criticality: 7, urgency: 5, status: 'pending', hours: 5 },
  { id: 'TDMS-004', asset: 'Power Feed PF5', type: 'Traction', defect: 'Insulation failure', criticality: 9, urgency: 7, status: 'pending', hours: 6 },
];

// Train Timetable & Corridor Block Availability (COA data)
const trainTimetable = [
  { train: 'Express-101', route: 'Section A1-C3', departure: '06:00', arrival: '08:30', priority: 'high' },
  { train: 'Passenger-205', route: 'Section B2-D4', departure: '09:00', arrival: '11:00', priority: 'medium' },
  { train: 'Freight-301', route: 'Section E5-A1', departure: '12:00', arrival: '14:00', priority: 'low' },
  { train: 'Express-102', route: 'Section S1-S3', departure: '15:00', arrival: '17:30', priority: 'high' },
];

const blockAvailability = {
  'Section A1': { available: true, hours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
  'Section B2': { available: true, hours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
  'Section C3': { available: false, hours: [6,7,8,9,10] }, // occupied by Express-101
  'Section D4': { available: true, hours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
  'Section E5': { available: true, hours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
  'Signal Box S1': { available: true, hours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
  'Signal Box S2': { available: true, hours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
  'Substation ST1': { available: true, hours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] },
};

// ─── AI Optimization Logic (mirrors python-ml/ai_engine.py) ───

function calculatePriorityScore(task) {
  return task.criticality * 0.5 + task.urgency * 0.3 + task.status_score * 0.2;
}

function generateWeeklyPlan(tasks) {
  const scored = tasks.map(t => ({
    ...t,
    score: t.criticality * 0.5 + t.urgency * 0.3 + t.hours * 0.1,
    priority_label: t.criticality >= 9 ? 'CRITICAL' : t.criticality >= 7 ? 'HIGH' : t.criticality >= 5 ? 'MEDIUM' : 'LOW',
    color: t.criticality >= 9 ? '#ef4444' : t.criticality >= 7 ? '#f59e0b' : t.criticality >= 5 ? '#3b82f6' : '#10b981'
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function optimizeBlockSchedule(allTasks) {
  const scheduled = [];
  const conflicts = [];
  const scored = generateWeeklyPlan(allTasks);
  let totalHours = 0;
  scored.forEach(t => { totalHours += t.hours; });

  const utilization = ((totalHours / (7 * 24)) * 100).toFixed(1);
  const assetAvailability = (100 - parseFloat(utilization)).toFixed(1);

  return {
    scheduled,
    metrics: {
      total_tasks: scored.length,
      total_hours: totalHours,
      utilization_percent: utilization,
      asset_availability: assetAvailability,
      critical_tasks: scored.filter(t => t.priority_label === 'CRITICAL').length,
      high_tasks: scored.filter(t => t.priority_label === 'HIGH').length,
      medium_tasks: scored.filter(t => t.priority_label === 'MEDIUM').length,
      low_tasks: scored.filter(t => t.priority_label === 'LOW').length,
    }
  };
}

// ─── HTTP Server ─────────────────────────────────────────────

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ─── API Routes ──────────────────────────────────────────

  if (url.pathname === '/api/block-plan' && req.method === 'GET') {
    const allTasks = [...trackMaintenance, ...signallingMaintenance, ...tractionMaintenance];
    const plan = optimizeBlockSchedule(allTasks);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(plan));
    return;
  }

  if (url.pathname === '/api/maintenance-tasks' && req.method === 'GET') {
    const allTasks = [...trackMaintenance, ...signallingMaintenance, ...tractionMaintenance];
    const scored = generateWeeklyPlan(allTasks);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tasks: scored, sources: { track: trackMaintenance.length, signalling: signallingMaintenance.length, traction: tractionMaintenance.length } }));
    return;
  }

  if (url.pathname === '/api/timetables' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ trains: trainTimetable, blocks: blockAvailability }));
    return;
  }

  if (url.pathname === '/api/utilization' && req.method === 'GET') {
    const allTasks = [...trackMaintenance, ...signallingMaintenance, ...tractionMaintenance];
    const plan = optimizeBlockSchedule(allTasks);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(plan.metrics));
    return;
  }

  if (url.pathname === '/api/optimize' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const allTasks = [...trackMaintenance, ...signallingMaintenance, ...tractionMaintenance];
      const plan = optimizeBlockSchedule(allTasks);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(plan));
    });
    return;
  }

  // ─── Serve Frontend Files ────────────────────────────────

  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, '..', 'frontend', filePath);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚂 SIH26027 Backend API running at http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   - GET  /api/block-plan`);
  console.log(`   - GET  /api/maintenance-tasks`);
  console.log(`   - GET  /api/timetables`);
  console.log(`   - GET  /api/utilization`);
  console.log(`   - POST /api/optimize`);
  console.log(`\n📋 Dashboard at http://localhost:3001/`);
});
