const http = require('http');
const fs = require('fs');
const path = require('path');

// In .NET 8/9 MapOpenApi() usually exposes the spec here by default
const openApiUrl = 'http://localhost:5011/openapi/v1.json';

console.log(`Fetching OpenAPI specification from ${openApiUrl}...`);

http.get(openApiUrl, (res) => {
    if (res.statusCode !== 200) {
        console.error(`\u274C Failed to fetch API docs. Server returned status code: ${res.statusCode}`);
        console.error('Make sure your ASP.NET backend is running!');
        process.exit(1);
    }

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            // Verify it's valid JSON before proceeding
            JSON.parse(data);
            
            // We use ReDoc (a beautiful open-source API documentation renderer)
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>API Documentation - SLIIT Tennis Management</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; background-color: #fafafa; }
    </style>
</head>
<body>
    <div id="redoc-container"></div>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
        // We embed the JSON spec directly into the HTML so it works offline
        const spec = ${data};
        Redoc.init(spec, {
            scrollYOffset: 50,
            theme: { 
                colors: { primary: { main: '#3498db' } },
                typography: { fontSize: '15px', fontFamily: 'Roboto, sans-serif' }
            }
        }, document.getElementById('redoc-container'));
    </script>
</body>
</html>`;

            const outputPath = path.join(__dirname, 'api_documentation.html');
            fs.writeFileSync(outputPath, htmlContent);
            
            console.log(`\u2705 Success!`);
            console.log(`API Documentation HTML has been generated and saved to:`);
            console.log(outputPath);
            
        } catch (e) {
            console.error('\u274C Error parsing JSON response or writing file:', e);
        }
    });
}).on('error', (err) => {
    console.error(`\u274C Error connecting to ${openApiUrl}: ${err.message}`);
    console.error('Make sure your ASP.NET backend is currently running before running this script!');
});
