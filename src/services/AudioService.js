class AudioService {
    static async playAudio(base64Audio) {
        try {
            // Convert base64 to array buffer
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            try {
                // Decode the audio data
                const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
                
                // Create and play the audio source
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(0);
            } catch (decodeError) {
                console.error('Error decoding audio:', decodeError);
                throw new Error('Failed to decode audio data');
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            throw error;
        }
    }
}

export default AudioService;
