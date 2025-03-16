const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 5001;

//Middleware
app.use(cors());
app.use(bodyParser.json());

//Routes
app.use('/api/sentiment', require('./routes/sentiment'));

//Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});