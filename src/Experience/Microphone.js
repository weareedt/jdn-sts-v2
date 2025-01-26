import Experience from './Experience.js';
import MesoliticaService from '../services/MesoliticaService.js';
import RecordRTC from 'recordrtc';
import { toast } from 'react-toastify';

export default class Microphone {
    static instance = null; // Ensure singleton
    static micAccessRequested = false; // Track microphone access requests

    constructor(setTranscription) {
        if (Microphone.instance) {
            console.warn('Microphone instance already exists. Reusing the existing instance.');
            return Microphone.instance;
        }

        this.debug = false;
        this.ready = false;
        this.volume = 0;
        this.levels = [];
        this.isRecording = false;
        this.isProcessing = false;
        this.recorder = null;
        this.transcription = '';
        this.setTranscription = setTranscription;
        this.permissionGranted = localStorage.getItem('micPermission') === 'true';

        if (Experience.instance) {
            this.experience = Experience.instance;
            this.debug = this.experience.debug;
        }

        // Assign singleton instance
        Microphone.instance = this;

        // Call requestMicrophoneAccess only if it hasn't been called
        if (!Microphone.micAccessRequested) {
            this.requestMicrophoneAccess();
        }
    }

    requestMicrophoneAccess() {
        // Prevent multiple calls
        if (Microphone.micAccessRequested) {
            console.warn('requestMicrophoneAccess has already been called. Skipping redundant calls.');
            return;
        }
        Microphone.micAccessRequested = true;

        navigator.mediaDevices
          .getUserMedia({
              audio: {
                  channelCount: 1,
                  sampleRate: 16000,
                  echoCancellation: true,
                  noiseSuppression: true,
              },
          })
          .then((_stream) => {
              this.stream = _stream;

              // Initialize audio-related features
              this.init();
              this.setupRecording();

              // Save permission status and notify the user
              localStorage.setItem('micPermission', 'true');
              toast.success('Microphone access granted. You can now record audio.');

              if (this.debug) {
                  console.log('Debug mode enabled. Initializing spectrum...');
                  this.setSpectrum();
              }
          })
          .catch((error) => {
              console.error('Error accessing microphone:', error);

              // Save permission status and handle errors
              localStorage.setItem('micPermission', 'false');

              if (error.name === 'NotAllowedError') {
                  toast.error('Microphone access denied. Please enable permissions and refresh the page.');
              } else {
                  toast.error('An error occurred while accessing the microphone. Please try again.');
              }
          });
    }

    init() {
        this.audioContext = new AudioContext();
        this.mediaStreamSourceNode = this.audioContext.createMediaStreamSource(this.stream);
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;
        this.mediaStreamSourceNode.connect(this.analyserNode);
        this.floatTimeDomainData = new Float32Array(this.analyserNode.fftSize);
        this.byteFrequencyData = new Uint8Array(this.analyserNode.fftSize);
        this.ready = true;
    }

    setupRecording() {
        this.recorder = new RecordRTC(this.stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=opus',
            recorderType: RecordRTC.StereoAudioRecorder,
            numberOfAudioChannels: 1,
            desiredSampRate: 16000,
        });
    }

    async processRecording(blob) {
        const bannedWord = [
            'Terima kasih kerana menonton',
            'saya akan mencuba untuk melakukan ini',
            'Fuck',
            'Saya akan membunuh anda',
        ];

        try {
            this.isProcessing = true;
            const transcription = await MesoliticaService.transcribeAudioStream(blob);

            if (transcription && this.setTranscription) {
                if (bannedWord.some((word) => transcription.toLowerCase().includes(word.toLowerCase()))) {
                    console.log('Banned word detected, clearing transcription...');
                    this.transcription = '';
                    this.setTranscription('');
                    toast.warning('Inappropriate words detected. Transcription cleared.');
                } else {
                    this.transcription = transcription;
                    console.log('Microphone received transcription:', this.transcription);
                    this.setTranscription(this.transcription);
                }
            }
        } catch (error) {
            console.error('Transcription error:', error);
            toast.error('An error occurred during transcription. Please try again.');
        } finally {
            this.isProcessing = false;
            this.setupRecording();
        }
    }

    startRecording() {

        if (!this.ready || !this.recorder) {
            toast.error('Microphone is not ready. Please refresh the page and try again.');
            return;
        }

        if (this.isRecording) {
            toast.warning('Recording is already in progress.');
            return;
        }

        try {
            this.isRecording = true;
            this.recorder.startRecording();
            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.isRecording = false;
            toast.error('Failed to start recording. Please try again.');
        }
    }

    stopRecording() {
        if (!this.isRecording || !this.recorder) {
            toast.warning('No recording in progress to stop.');
            return;
        }

        try {
            this.isRecording = false;
            this.recorder.stopRecording(async () => {
                const blob = this.recorder.getBlob();
                console.log('Recording stopped, processing blob:', blob);

                if (blob && blob.size > 0) {
                    await this.processRecording(blob);
                } else {
                    toast.warning('Recording was empty. Please try again.');
                }
            });
        } catch (error) {
            console.error('Error stopping recording:', error);
            toast.error('Failed to stop recording. Please try again.');
        }
    }

    getLevels() {
        const bufferLength = this.analyserNode.fftSize;
        const levelCount = 8;
        const levelBins = Math.floor(bufferLength / levelCount);

        const levels = [];
        let max = 0;

        for (let i = 0; i < levelCount; i++) {
            let sum = 0;

            for (let j = 0; j < levelBins; j++) {
                sum += this.byteFrequencyData[i * levelBins + j];
            }

            const value = sum / levelBins / 256;
            levels[i] = value;

            if (value > max) max = value;
        }

        return levels;
    }

    getVolume() {
        let sumSquares = 0.0;
        for (const amplitude of this.floatTimeDomainData) {
            sumSquares += amplitude * amplitude;
        }
        return Math.sqrt(sumSquares / this.floatTimeDomainData.length);
    }

    update() {
        if (!this.ready) return;

        this.analyserNode.getByteFrequencyData(this.byteFrequencyData);
        this.analyserNode.getFloatTimeDomainData(this.floatTimeDomainData);

        this.volume = this.getVolume();
        this.levels = this.getLevels();

        if (this.spectrum) this.spectrum.update();
    }
}
