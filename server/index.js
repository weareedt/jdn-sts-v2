const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for our React frontend
app.use(cors());  // Allow all origins during development

// Parse JSON bodies
app.use(express.json());

// TTS endpoint
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;
        const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice ID

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': "sk_f34a70fc2e48b53b126d4a6a853808a706f87f177f1b9572"
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });
        console.log('TTS response:', response);

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBuffer = await response.buffer();
        const base64Audio = audioBuffer.toString('base64');
        res.json({ audio: base64Audio });
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'TTS generation failed' });
    }
});

// Proxy endpoint
app.post('/api/forward_message', async (req, res) => {
    try {
        const response = await fetch('https://aishah.jdn.gov.my/api/forward_message', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNDUifQ.E1MDASE64Q_yMqDZNzBX2nGZK78NRXUP8cJE2I8-wns',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: req.body.message,
                session_id: req.body.session_id
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
