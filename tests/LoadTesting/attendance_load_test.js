const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const url = 'http://localhost:5011/api/Health';
const totalRequests = 200;
const concurrency = 20;

let completed = 0;
let successes = 0;
let errors = 0;
let times = [];

const startTime = Date.now();

// Function to make a single HTTP GET request
async function makeRequest() {
    return new Promise((resolve) => {
        const reqStart = Date.now();
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - reqStart;
                if (res.statusCode === 200) {
                    successes++;
                } else {
                    errors++;
                }
                times.push(duration);
                resolve();
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - reqStart;
            errors++;
            times.push(duration);
            resolve();
        });
    });
}

// Function to manage concurrent execution
async function runTest() {
    console.log(`Starting load test against ${url}...`);
    console.log(`Simulating ${concurrency} concurrent users sending ${totalRequests} total requests.\n`);
    
    // Draw a simple progress bar
    process.stdout.write('[');

    let active = 0;
    let pending = totalRequests;

    return new Promise((resolve) => {
        function next() {
            if (pending === 0 && active === 0) {
                process.stdout.write('] 100%\n');
                resolve();
                return;
            }

            while (active < concurrency && pending > 0) {
                active++;
                pending--;
                makeRequest().then(() => {
                    active--;
                    completed++;
                    
                    // Update progress bar
                    if (completed % (totalRequests / 10) === 0) {
                        process.stdout.write('=');
                    }
                    
                    next();
                });
            }
        }
        next();
    });
}

// Run the test and print results
runTest().then(() => {
    const totalTime = Date.now() - startTime;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const throughput = (totalRequests / (totalTime / 1000)).toFixed(2);
    
    // Terminal Output
    console.log("\n==========================================");
    console.log("       PERFORMANCE TEST RESULTS           ");
    console.log("==========================================");
    console.log(`Total Time Elapsed    : ${totalTime} ms`);
    console.log(`Overall Throughput    : ${throughput} req/sec`);
    console.log(`Successful Requests   : ${successes} / ${totalRequests}`);
    console.log(`Failed/Errored        : ${errors}`);
    console.log("------------------------------------------");
    console.log(`Min Response Time     : ${min} ms`);
    console.log(`Average Response Time : ${avg.toFixed(2)} ms`);
    console.log(`Max Response Time     : ${max} ms`);
    console.log("==========================================\n");

    // Generate HTML Report
    const htmlReport = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Performance Test Report</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333; display: flex; justify-content: center; padding-top: 50px; }
            .container { background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 600px; width: 100%; }
            h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 30px; }
            .metric { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; font-size: 1.1em; }
            .metric:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #7f8c8d; }
            .value { font-weight: bold; color: #2c3e50; }
            .success { color: #27ae60; }
            .error { color: #e74c3c; }
            .highlight { color: #3498db; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Load Test Results</h1>
            <div class="metric"><span class="label">Target Endpoint:</span> <span class="value">${url}</span></div>
            <div class="metric"><span class="label">Total Requests Simulated:</span> <span class="value">${totalRequests}</span></div>
            <div class="metric"><span class="label">Concurrent Users:</span> <span class="value">${concurrency}</span></div>
            <div class="metric"><span class="label">Total Time Elapsed:</span> <span class="value highlight">${totalTime} ms</span></div>
            <div class="metric"><span class="label">Overall Throughput:</span> <span class="value highlight">${throughput} req/sec</span></div>
            <div class="metric"><span class="label">Successful Requests:</span> <span class="value success">${successes}</span></div>
            <div class="metric"><span class="label">Failed/Errored:</span> <span class="value ${errors > 0 ? 'error' : 'value'}">${errors}</span></div>
            <div class="metric"><span class="label">Minimum Response Time:</span> <span class="value">${min} ms</span></div>
            <div class="metric"><span class="label">Average Response Time:</span> <span class="value highlight">${avg.toFixed(2)} ms</span></div>
            <div class="metric"><span class="label">Maximum Response Time:</span> <span class="value">${max} ms</span></div>
        </div>
    </body>
    </html>
    `;

    const reportPath = path.join(__dirname, 'performance_report.html');
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`\u2705 HTML Report successfully saved to: ${reportPath}`);
});

