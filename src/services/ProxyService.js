const BASE_URL = process.env.REACT_APP_BASE_URL

class ProxyService {
    static async post(message) {
        const response = await fetch(`${BASE_URL}/api/forward_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: '123456789',
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    static async TTS(message) {
        const response = await fetch(`${BASE_URL}/api/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    static async AudioTranscribe(formData) {
        try {
            const response = await fetch(`${BASE_URL}/api/transcribe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Transcription API error: ${response.status} - ${errorData}`);
            }

            return response.json();
        } catch (error) {
            console.error('Transcription error:', error.message);
            throw error;
        }
    }
}

export default ProxyService;
