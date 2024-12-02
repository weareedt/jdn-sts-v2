const { ElevenLabsClient } = require("elevenlabs");

const ELEVENLABS_API_KEY = "sk_f34a70fc2e48b53b126d4a6a853808a706f87f177f1b9572";

if (!ELEVENLABS_API_KEY) {
    throw new Error("Missing ELEVENLABS_API_KEY in environment variables");
}

const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY
});

async function createAudioStreamFromText(text) {
    try {
        const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice ID
        const audioStream = await client.textToSpeech.convert(voiceId, {
            model_id: "eleven_multilingual_v2",
            text: text
        });

        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    } catch (error) {
        console.error('ElevenLabs API error:', error);
        throw error;
    }
}

module.exports = {
    createAudioStreamFromText
};
