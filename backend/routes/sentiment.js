const express = require('express');
const router = express.Router();
const { analyzeSentiment, analyzePlayStoreSentiment } = require('../controllers/sentimentController');

router.post('/analyze-normal/:platform', analyzeSentiment);

router.post('/analyze-with-location/:platform/:location', analyzeSentiment);

router.post('/analyze-playstore/:appName', analyzePlayStoreSentiment);
module.exports = router;