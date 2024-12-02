class AudioService {
    static audioContext = null;
    static analyser = null;
    static dataArray = null;
    static levels = [0, 0, 0]; // Low, mid, high frequencies

    static async playAudio(base64Audio) {
        try {
            // Convert base64 to array buffer
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            try {
                // Decode the audio data
                const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
                
                // Create and setup audio nodes
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;

                // Create analyzer
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 1024;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

                // Connect nodes
                source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
                
                // Start playing
                source.start(0);

                // Start analyzing
                this.startAnalyzing();
            } catch (decodeError) {
                console.error('Error decoding audio:', decodeError);
                throw new Error('Failed to decode audio data');
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            throw error;
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
