const express = require('express');

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
const PORT = 80;
app.listen(PORT, () => {
    console.log(`REST server listening on http://localhost:${PORT}`);
});
