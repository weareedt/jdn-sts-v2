class AudioService {
    static audioContext = null;
    static analyser = null;
    static dataArray = null;
    static levels = [0, 0, 0]; // Low, mid, high frequencies

    static async playAudio(base64Audio) {
        console.log('playAudio: Start');

        try {
            // Step 1: Convert base64 string to binary
            console.log('playAudio: Converting base64 to binary string');
            let binaryString;
            try {
                binaryString = atob(base64Audio);
            } catch (atobError) {
                console.error('playAudio: Invalid base64 string. Ensure the input is correctly encoded.');
                throw new Error(`Base64 decoding failed: ${atobError.message}`);
            }

            console.log('playAudio: Successfully converted base64 to binary string');

            // Step 2: Convert binary string to Uint8Array
            console.log('playAudio: Creating Uint8Array from binary string');
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            console.log('playAudio: Uint8Array created successfully');

            // Step 3: Create AudioContext
            console.log('playAudio: Creating AudioContext');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Step 4: Decode audio data
            console.log('playAudio: Decoding audio data');
            let audioBuffer;
            try {
                audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
            } catch (decodeError) {
                console.error('playAudio: Failed to decode audio data. Verify the format of the audio.');
                throw new Error(`Audio decoding failed: ${decodeError.message}`);
            }
            console.log('playAudio: Audio data decoded successfully');

            // Step 5: Create and setup audio nodes
            console.log('playAudio: Setting up audio nodes');
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Step 6: Create analyser for audio visualization
            console.log('playAudio: Creating analyser node');
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 1024;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            // Step 7: Connect nodes
            console.log('playAudio: Connecting audio nodes');
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Step 8: Start audio playback
            console.log('playAudio: Starting playback');
            source.start(0);
            console.log('playAudio: Playback started successfully');

            // Step 9: Start audio analysis
            console.log('playAudio: Starting audio analysis');
            this.startAnalyzing();
            console.log('playAudio: Audio analysis started successfully');

        } catch (error) {
            console.error('playAudio: Error occurred during audio playback:', error);
            throw error;
        } finally {
            console.log('playAudio: End');
        }
    }


    static startAnalyzing() {
        const analyze = () => {
            if (!this.analyser) return;

            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Calculate frequency bands
            const bassEnd = Math.floor(this.analyser.frequencyBinCount * 0.1);    // First 10% for bass
            const midEnd = Math.floor(this.analyser.frequencyBinCount * 0.5);     // Next 40% for mids
            // Remaining 50% for highs

            let bassSum = 0;
            let midSum = 0;
            let highSum = 0;

            // Calculate averages for each frequency band
            for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
                const value = this.dataArray[i] / 255.0; // Normalize to 0-1
                if (i <= bassEnd) {
                    bassSum += value;
                } else if (i <= midEnd) {
                    midSum += value;
                } else {
                    highSum += value;
                }
            }

            // Update levels
            this.levels[0] = bassSum / bassEnd;                           // Bass level
            this.levels[1] = midSum / (midEnd - bassEnd);                // Mid level
            this.levels[2] = highSum / (this.analyser.frequencyBinCount - midEnd); // High level

            // Request next frame
            requestAnimationFrame(analyze);
        };

        analyze();
    }

    static getLevels() {
        return this.levels;
    }

    static isActive() {
        return this.audioContext !== null && this.analyser !== null;
    }
}

export default AudioService;
