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

const ldap = require('ldapjs');
// Configuración del servidor LDAP
const LDAP_URL = 'ldap://localhost:389';
const BASE_DN = 'dc=dawmor,dc=cloud';
const PEOPLE_DN = 'ou=people,' + BASE_DN;
const GROUPS_DN = 'ou=groups,' + BASE_DN;
const ldapClient = ldap.createClient({
    url: LDAP_URL,
});


/ Endpoint: validate + name + password
app.post('/validate', (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).send({ error: 'Missing name or password' });
    }

    const userDN = `uid=${name},${PEOPLE_DN}`;
    ldapClient.bind(userDN, password, (err) => {
        if (err) {
            return res.status(401).send({ authenticated: false });
        }
        res.send({ authenticated: true });
    });
});

// Endpoint: email + name
app.post('/email/:name', (req, res) => {
    const name = req.params.name;

    ldapClient.search(PEOPLE_DN, { filter: `(uid=${name})`, scope: 'sub' }, (err, result) => {
        if (err) return res.status(500).send({ error: err.message });
        let email = null;
        result.on('searchEntry', (entry) => {
            // Attempt to extract attributes directly
            if (entry.object) {
                console.log('Object:', entry.object);
                email = entry.object.mail;
            }
            // Fallback: Process raw attributes if necessary
            if (!email && entry.attributes) {
                const mailAttr = entry.attributes.find(attr => attr.type === 'mail');
                if (mailAttr && mailAttr.vals.length > 0) {
                    email = mailAttr.vals[0];
                }
            }
        });
        result.on('end', () => {
            if (email) {
                res.send({ email });
            } else { res.status(404).send({ error: 'User not found' });
            }
        });
    });
});

// Endpoint: group + groupName
app.post('/group/:groupName', (req, res) => {
    const groupName = req.params.groupName;

    ldapClient.search(GROUPS_DN, { filter: `(cn=${groupName})`, scope: 'sub' }, (err, result) => {
        if (err) return res.status(500).send({ error: err.message });

        let members = [];
        result.on('searchEntry', (entry) => {

            if (entry.object) {
                const memberAttr = entry.object.member;
                if (Array.isArray(memberAttr)) {
                    members.push(...memberAttr);
                } else if (memberAttr) {
                    members.push(memberAttr);
                }
            } else if (entry.attributes) {
                // Fallback: handle attributes
                const memberAttr = entry.attributes.find(attr => attr.type === 'member');
                if (memberAttr && memberAttr.vals) {
                    members.push(...memberAttr.vals);
                }
            } else {
                console.error('Unrecognized entry structure:', entry);
            }
        });
        result.on('end', () => {
            if (members.length > 0) {
                res.send({ members: members });
            } else {
                res.status(404).send({ error: 'Group not found or empty' });
            }
        });
    });
});
