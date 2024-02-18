const express = require('express');
const bodyParser = require('body-parser');
const createDocument = require('./HTTPCreate.js');
const readDocument = require('./HTTPRead.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Here is the Assignment - Lab 4 – Implementing Containers with Docker.'))

// Use the imported functions as route handlers
app.post('/create-document', createDocument);
app.get('/read-document', readDocument);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

