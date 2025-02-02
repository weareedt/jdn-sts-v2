class AudioService {
    static audioContext = null;
    static analyser = null;
    static dataArray = null;
    static levels = [0, 0, 0]; // Low, mid, high frequencies
    static currentSource = null; // Store the current AudioBufferSourceNode
    static gainNode = null; // GainNode for volume control

    static async playAudio(base64Audio) {
        return new Promise(async (resolve, reject) => {
            console.log('playAudio: Start');

            try {
                // Stop currently playing audio (if any)
                this.stopAudio();

                let binaryString;
                try {
                    binaryString = atob(base64Audio);
                } catch (atobError) {
                    console.error('Invalid base64 string.');
                    return reject(new Error(`Base64 decoding failed: ${atobError.message}`));
                }

                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                let audioBuffer;
                try {
                    audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
                } catch (decodeError) {
                    return reject(new Error(`Audio decoding failed: ${decodeError.message}`));
                }

                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;

                if (!this.gainNode) {
                    this.gainNode = this.audioContext.createGain();
                }

                this.setVolumeMultiplier(parseFloat(process.env.REACT_APP_VOLUME_MULTIPLIER || 1.0));
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 1024;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

                source.connect(this.gainNode);
                this.gainNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
                this.currentSource = source;

                source.start(0);
                this.startAnalyzing();

                console.log('playAudio: Playback started successfully');
                resolve(audioBuffer.duration * 1000); // Resolve with audio duration in milliseconds

            } catch (error) {
                console.error('Error during audio playback:', error);
                reject(error);
            }
        });
    }

    static stopAudio() {
        console.log('stopAudio: Stopping audio playback');
        if (this.currentSource) {
            try {
                this.currentSource.stop(); // Stop the current audio source
                this.currentSource.disconnect(); // Disconnect the source
                if (this.gainNode) this.gainNode.disconnect(); // Disconnect the GainNode
                if (this.analyser) this.analyser.disconnect(); // Disconnect the AnalyserNode
                console.log('stopAudio: Audio stopped and nodes disconnected successfully');
            } catch (error) {
                console.error('stopAudio: Error stopping audio:', error);
            }
            this.currentSource = null; // Clear the current source reference
        } else {
            console.log('stopAudio: No audio to stop');
        }
    }

    static startAnalyzing() {
        const analyze = () => {
            if (!this.analyser) return;

            this.analyser.getByteFrequencyData(this.dataArray);

            // Calculate frequency bands
            const bassEnd = Math.floor(this.analyser.frequencyBinCount * 0.1); // First 10% for bass
            const midEnd = Math.floor(this.analyser.frequencyBinCount * 0.5); // Next 40% for mids
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
            this.levels[0] = bassSum / bassEnd; // Bass level
            this.levels[1] = midSum / (midEnd - bassEnd); // Mid level
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

    static setVolumeMultiplier(multiplier) {
        if (this.gainNode) {
            this.gainNode.gain.value = multiplier;
            console.log(`Volume multiplier set to: ${multiplier}`);
        } else {
            console.warn('GainNode is not initialized yet.');
        }
    }

}

export default AudioService;
