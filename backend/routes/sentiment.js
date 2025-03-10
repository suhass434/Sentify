const express = require('express');
const router = express.Router();
const { analyzeSentiment, analyzePlayStoreSentiment } = require('../controllers/sentimentController');

router.post('/analyze/playstore/:appName', analyzePlayStoreSentiment);
router.post('/analyze/:platform/:location', analyzeSentiment);

module.exports = router;