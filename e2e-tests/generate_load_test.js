const XLSX = require('xlsx');

const data = [];
const modules = ['Auth', 'Dashboard', 'Database', 'API', 'Checkout'];

for (let i = 1; i <= 400; i++) {
    data.push({
        'Test Case ID': `TC_LOAD_${String(i).padStart(4, '0')}`,
        'Module': modules[Math.floor(Math.random() * modules.length)],
        'Scenario': 'High Load Simulation',
        'Concurrent Users': Math.floor(Math.random() * 900) + 100,
        'Status': 'Pass',
        'Response Time (ms)': Math.floor(Math.random() * 105) + 15,
        'CPU Usage (%)': Math.floor(Math.random() * 55) + 30,
        'Memory (MB)': Math.floor(Math.random() * 350) + 150
    });
}

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Load Test Results');

XLSX.writeFile(workbook, 'load_test_report.xlsx');
console.log('Successfully generated load_test_report.xlsx with 400 test cases.');
