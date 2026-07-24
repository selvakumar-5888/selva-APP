const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const LOG_FILE = path.join(__dirname, 'backend.log');

// Clear previous backend.log if exists
fs.writeFileSync(LOG_FILE, `[Backend Server Initialized at ${new Date().toISOString()}]\n`);

function writeLog(message) {
    const logLine = `[Backend] ${message}\n`;
    process.stdout.write(logLine);
    fs.appendFileSync(LOG_FILE, logLine);
}

const server = http.createServer((req, res) => {
    const startTime = process.hrtime();
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Router handling
    let responseData = { status: 'success', message: 'API active' };
    let statusCode = 200;

    if (pathname === '/api/health') {
        responseData = { status: 'healthy', uptime: process.uptime() };
    } else if (pathname === '/api/auth/login') {
        responseData = { token: 'mock-jwt-token-xyz-123', role: 'user', name: 'Demo Scholar' };
    } else if (pathname === '/api/market/all-crops') {
        responseData = [
            { crop: 'Wheat', price: '₹2,125/Qtl', state: parsedUrl.query.state || 'Maharashtra' },
            { crop: 'Paddy', price: '₹1,940/Qtl', state: parsedUrl.query.state || 'Maharashtra' },
            { crop: 'Cotton', price: '₹6,020/Qtl', state: parsedUrl.query.state || 'Maharashtra' }
        ];
    } else if (pathname === '/api/expense') {
        responseData = [
            { id: 1, title: 'Fertilizers', amount: 4500, category: 'Input' },
            { id: 2, title: 'Seed Purchase', amount: 2800, category: 'Seeds' }
        ];
    } else if (pathname === '/api/alert/my-alerts') {
        responseData = [
            { id: 'ALT-1', type: 'Weather Alert', message: 'Heavy rainfall predicted in 48 hours.' }
        ];
    } else if (pathname === '/api/farm/profile') {
        responseData = { farmId: 'FARM-8821', owner: 'Demo Scholar', acreage: 12.5 };
    } else if (pathname === '/api/crop/all') {
        responseData = [
            { id: 'C-1', name: 'Sugarcane', status: 'Healthy' },
            { id: 'C-2', name: 'Soybean', status: 'Optimal Growth' }
        ];
    } else if (pathname === '/api/officer/queries') {
        responseData = [
            { id: 'ADV-101', farmerName: 'Ramesh Kumar', issue: 'Yellow rust infestation' }
        ];
    } else if (pathname === '/api/admin/users') {
        responseData = [
            { id: 'USR-001', name: 'Ramesh Farmer', role: 'User' },
            { id: 'USR-002', name: 'Officer Vikram', role: 'Officer' },
            { id: 'USR-003', name: 'System Administrator', role: 'Admin' }
        ];
    }

    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));

    // Log in standard format shown in GitHub Actions
    writeLog(`${req.method} ${req.url} ${statusCode} ${durationMs} ms - -`);
});

server.listen(PORT, () => {
    writeLog(`Server running on port ${PORT}`);
    writeLog(`Global Agmarknet Sync Initialized`);
});
