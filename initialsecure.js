const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
app.use(express.json()); 

// Endpoint: hello + name
app.get('/hello/:name', (req, res) => {
    const name = req.params.name;
    res.send(`Hello ${name}`);
});

// Endpoint: bye + name
app.get('/bye/:name', (req, res) => {
    const name = req.params.name;
    res.send(`Bye ${name}`);
});

// Start the server
const PORT = 443;
// Load SSL/TLS certificates
const SSL_KEY = '/etc/letsencrypt/live/ldapserver.mmilitar.dawmor.cloud/fullchain.pem'; 
// Path to the private key file
const SSL_CERT = '/etc/letsencrypt/live/dapserver.mmilitar.dawmor.cloud/privkey.pem'; 
// Path to the certificate file
const options = {
    key: fs.readFileSync(SSL_KEY),
    cert: fs.readFileSync(SSL_CERT),
};
// Start the HTTPS server
https.createServer(options, app).listen(PORT, () => {
	 res.end('Hello DAW2, I am a Secure Server');
	console.log(`HTTPS server listening on https://localhost:${PORT}
}); 

