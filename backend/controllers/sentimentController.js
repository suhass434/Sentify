const { exec } = require('child_process');
const path = require('path');

const analyzeSentiment = (req, res) => {
    const ProductName = req.params.platform;
    const ProductLocation = req.params.location;
    
    if (!ProductName) {
        return res.status(400).json({message: 'Product name is required'});
    }

    const scriptPath = path.join(__dirname, '../scripts/sentiment.py');
    
    const command = `python3 "${scriptPath}" "${ProductName}" "${ProductLocation}"`;
    
    const options = {
        timeout: 6000000,
        maxBuffer: 1024 * 1024
    };

    exec(command, options, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to analyze sentiment' });
        }
        
        try {
            const jsonStartIndex = stdout.indexOf('{');
            const jsonPart = stdout.substring(jsonStartIndex);

            const sentimentData = JSON.parse(jsonPart);

            const messages = stdout.substring(0, jsonStartIndex).trim();
            if (messages) {
                sentimentData.messages = messages.split('\n');
            }
            res.json(sentimentData);
        } catch (parseError) {
            console.error(`JSON Parse Error: ${parseError.message}`);
            res.status(500).json({ error: 'Invalid response from sentiment analysis script' });
        }
    });
};

const analyzePlayStoreSentiment = (req, res) => {
    const appName = req.params.appName;
    
    if (!appName) {
        return res.status(400).json({ message: 'App name is required' });
    }

    const scriptPath = path.join(__dirname, '../scripts/playstore_sentiment_analysis.py');

    exec(`python3 "${scriptPath}" "${appName}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution Error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to analyze sentiment' });
        }
        if (stderr) console.warn(`Python stderr: ${stderr}`); // Don't treat stderr as an error

        try {
            const sentimentData = JSON.parse(stdout.trim());
            res.json(sentimentData);
        } catch (parseError) {
            console.error(`JSON Parse Error: ${parseError.message}, Output: ${stdout}`);
            res.status(500).json({ error: 'Invalid response from sentiment analysis script' });
        }
    });
};

module.exports = {
    analyzeSentiment,
    analyzePlayStoreSentiment
};