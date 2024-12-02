const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Node.js doesn't have fetch built-in

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for our React frontend
app.use(cors({
    origin: 'http://localhost:8080', // webpack dev server default port
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

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
