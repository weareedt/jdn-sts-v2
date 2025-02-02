const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const FormData = require('form-data');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const spdy = require('spdy');
const fetch = require('node-fetch'); // using node-fetch v2 for Node 18 compatibility
const https = require('https');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Configure Multer for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create HTTPS agents with keep-alive enabled for upstream API calls.
const aishahAgent = new https.Agent({ keepAlive: true });
const elevenlabsAgent = new https.Agent({ keepAlive: true });
const mesoliticaAgent = new https.Agent({ keepAlive: true });

/**
 * Endpoint: Text-to-Speech (TTS)
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
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_multilingual_v2",
                stability: 1,
                similarity_boost: 1,
            }),
            agent: elevenlabsAgent // reuse connection via keep-alive agent
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        // node-fetch v2 returns a Buffer via response.buffer()
        const audioBuffer = await response.buffer();
        const base64Audio = audioBuffer.toString('base64');
        res.json({ audio: base64Audio });
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'TTS generation failed' });
    }
});

/**
 * Endpoint: Forward Message (LLM Proxy)
 *
 * This endpoint now streams the response directly from the Aishah JDN API
 * to the client instead of buffering the entire response first.
 */
app.post('/api/forward_message', async (req, res) => {
    try {
        const upstreamResponse = await fetch('https://aishah.jdn.gov.my/api/forward_message', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.JDN_AISHAH_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: req.body.message,
                session_id: req.body.session_id
            }),
            agent: aishahAgent
        });

        if (!upstreamResponse.ok) {
            throw new Error(`Aishah API error: ${upstreamResponse.status}`);
        }

        // Set the status and copy upstream response headers to the client
        res.status(upstreamResponse.status);
        upstreamResponse.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        // Stream the upstream response directly to the client to reduce overhead
        upstreamResponse.body.pipe(res);
    } catch (error) {
        console.error('Forward Message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Endpoint: Audio Transcription
 */
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
                // formData.getHeaders() provides the correct Content-Type header
                ...formData.getHeaders(),
                'Authorization': `Bearer ${process.env.MESOLITICA_API_KEY}`,
                'Accept': 'application/json'
            },
            body: formData,
            agent: mesoliticaAgent
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

/**
 * Create an HTTP/2 server with TLS using SPDY.
 * For development, you can generate self-signed certificates using OpenSSL:
 *   openssl req -nodes -new -x509 -keyout server.key -out server.crt
 */
const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};

spdy.createServer(options, app).listen(PORT, (err) => {
    if (err) {
        console.error('Failed to start HTTP/2 server:', err);
        process.exit(1);
    } else {
        console.log(`HTTP/2 server running on port ${PORT}`);
    }
});
