const https = require('https');

console.log("Starting basic network test to google.com...");
https.get('https://www.google.com', (res) => {
  console.log('Status Code:', res.statusCode);
}).on('error', (e) => {
  console.error("Network Error:", e);
});
