// save-server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3005;

app.use(express.json({ limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'act-cms-submission')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/api/save-slides', async (req, res) => {
    try {
        const { sectionHTML, currentSection } = req.body;
        
        console.log('💾 Saving entire section:', currentSection);
        
        const targetFilePath = path.join(__dirname, 'sections', `${currentSection}.html`);
        
        console.log(`Attempting to save to: ${targetFilePath}`);
        
        await fs.writeFile(targetFilePath, sectionHTML, 'utf8');
        
        console.log(`✅ Saved ${sectionHTML.length} characters to ${targetFilePath}`);
        
        res.json({ 
            success: true, 
            filename: targetFilePath,
            size: sectionHTML.length
        });
        
    } catch (error) {
        console.error('❌ Save failed:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`💾 Application and save server running on http://localhost:${PORT}`);
    console.log(`🔗 Access your app by navigating to http://localhost:${PORT}/index.html`);
});