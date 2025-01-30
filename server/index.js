const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const multer = require('multer');
const FormData = require('form-data');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for our React frontend
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Text-to-Speech (TTS) API
 */
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;
        const voiceId = "djUbJhnXETnX31p3rgun"; // Rachel voice ID

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY // Secure API key storage
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                stability: 1,
                similarity_boost: 1,
            })
        });

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

/**
 * Forward Message API (LLM Proxy)
 */
app.post('/api/forward_message', async (req, res) => {
    try {
        const response = await fetch('https://aishah.jdn.gov.my/api/forward_message', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.JDN_AISHAH_API_KEY}`, // Secure API key storage
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

// Audio Transcription Route
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: 'audio.webm',
            contentType: 'audio/webm;codecs=opus'
        });
        formData.append('model', 'base');
        formData.append('language', 'ms');

        const response = await fetch('https://api.mesolitica.com/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MESOLITICA_API_KEY}`,
                'Accept': 'application/json'
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mesolitica API error: ${response.status} - ${errorText}`);
        }

        const transcription = await response.json();
        res.json(transcription);
    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});


// Start the proxy server
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
