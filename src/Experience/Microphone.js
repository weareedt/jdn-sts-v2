import Experience from './Experience.js'
import MesoliticaService from '../services/MesoliticaService.js'
import RecordRTC from 'recordrtc'

export default class Microphone {
    constructor(setTranscription, pttButton) {
        this.experience = Experience.instance
        this.debug = this.experience.debug
        this.ready = false
        this.volume = 0
        this.levels = []
        this.isRecording = false
        this.isProcessing = false
        this.recorder = null
        this.transcription = ''
        this.setTranscription = setTranscription
        this.isPTTActive = false
        this.pttButton = pttButton

        // Define SVG icons
        this.icons = {
            idle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>`,
            recording: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>`,
            processing: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v6l4 2"></path>
                <circle cx="12" cy="12" r="10"></circle>
            </svg>`
        }

        navigator.mediaDevices
            .getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            })
            .then((_stream) => {
                this.stream = _stream
                this.init()
                this.setupRecording()

                if (this.debug) {
                    this.setSpectrum()
                }
            })
            .catch((error) => {
                console.error('Error accessing microphone:', error)
            })
    }

    updateButtonState(state) {
        this.pttButton.innerHTML = this.icons[state]
        switch(state) {
            case 'recording':
                this.pttButton.style.backgroundColor = '#6D28D9' // Dark purple
                this.pttButton.style.transform = 'translateX(-50%) scale(0.95)'
                break
            case 'processing':
                this.pttButton.style.backgroundColor = '#7C3AED' // Medium purple
                this.pttButton.style.transform = 'translateX(-50%) scale(1)'
                // Add rotation animation for processing state
                this.pttButton.style.animation = 'spin 2s linear infinite'
                break
            default: // idle
                this.pttButton.style.backgroundColor = '#8B5CF6' // Light purple
                this.pttButton.style.transform = 'translateX(-50%) scale(1)'
                this.pttButton.style.animation = 'none'
                break
        }
    }

    init() {
        this.audioContext = new AudioContext()
        this.mediaStreamSourceNode = this.audioContext.createMediaStreamSource(this.stream)
        this.analyserNode = this.audioContext.createAnalyser()
        this.analyserNode.fftSize = 256
        this.mediaStreamSourceNode.connect(this.analyserNode)
        this.floatTimeDomainData = new Float32Array(this.analyserNode.fftSize)
        this.byteFrequencyData = new Uint8Array(this.analyserNode.fftSize)
        this.ready = true

        // Add CSS for rotation animation
        const style = document.createElement('style')
        style.textContent = `
            @keyframes spin {
                from { transform: translateX(-50%) rotate(0deg); }
                to { transform: translateX(-50%) rotate(360deg); }
            }
        `
        document.head.appendChild(style)
    }

    setupRecording() {
        // Configure RecordRTC
        this.recorder = new RecordRTC(this.stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=opus',
            recorderType: RecordRTC.StereoAudioRecorder,
            numberOfAudioChannels: 1,
            desiredSampRate: 16000
        })

        // Add button event listeners for push-to-talk
        this.pttButton.addEventListener('mousedown', () => {
            if (!this.isPTTActive && !this.isProcessing) {
                this.isPTTActive = true
                this.startRecording()
                this.updateButtonState('recording')
                console.log('Push-to-talk activated')
            }
        })

        this.pttButton.addEventListener('mouseup', () => {
            if (this.isPTTActive) {
                this.isPTTActive = false
                this.stopRecording()
                console.log('Push-to-talk deactivated')
            }
        })

        this.pttButton.addEventListener('mouseleave', () => {
            if (this.isPTTActive) {
                this.isPTTActive = false
                this.stopRecording()
                console.log('Push-to-talk deactivated')
            }
        })

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPTTActive) {
                this.isPTTActive = false
                this.stopRecording()
                console.log('Push-to-talk deactivated due to page visibility change')
            }
        })

        // Set initial state
        this.updateButtonState('idle')
    }

    async processRecording(blob) {
        const bannedWord = [
            'Terima kasih kerana menonton', 
            'saya akan mencuba untuk melakukan ini',
            'Fuck',
            'Saya akan membunuh anda',
        ]

        try {
            this.isProcessing = true
            this.updateButtonState('processing')
            
            const transcription = await MesoliticaService.transcribeAudioStream(blob)
            
            if (transcription && this.setTranscription) {
                if (bannedWord.some(word => transcription.toLowerCase().includes(word.toLowerCase()))) {
                    console.log('Banned word detected, clearing transcription...')
                    this.transcription = ''
                    this.setTranscription('')
                } else {
                    this.transcription = transcription
                    console.log('Microphone received transcription:', this.transcription)
                    this.setTranscription(prevTranscription => {
                        return this.transcription
                    })
                }
            }
        } catch (error) {
            console.error('Transcription error:', error)
        } finally {
            this.isProcessing = false
            this.updateButtonState('idle')
            // Setup new recorder for next recording
            this.setupRecording()
        }
    }

    startRecording() {
        if (!this.isRecording && this.recorder && !this.isProcessing) {
            this.isRecording = true
            this.recorder.startRecording()
            console.log('Recording started')
        }
    }

    stopRecording() {
        if (this.isRecording && this.recorder) {
            this.isRecording = false
            this.recorder.stopRecording(async () => {
                const blob = this.recorder.getBlob()
                console.log('Recording stopped, processing blob:', blob)
                if (blob && blob.size > 0) {
                    await this.processRecording(blob)
                }
            })
        }
    }

    setSpectrum() {
        this.spectrum = {}
        this.spectrum.width = this.analyserNode.fftSize
        this.spectrum.height = 128
        this.spectrum.halfHeight = Math.round(this.spectrum.height * 0.5)
        
        this.spectrum.canvas = document.createElement('canvas')
        this.spectrum.canvas.width = this.spectrum.width
        this.spectrum.canvas.height = this.spectrum.height
        this.spectrum.canvas.style.position = 'fixed'
        this.spectrum.canvas.style.left = 0
        this.spectrum.canvas.style.bottom = 0
        document.body.append(this.spectrum.canvas)

        this.spectrum.context = this.spectrum.canvas.getContext('2d')
        this.spectrum.context.fillStyle = '#ffffff'

        this.spectrum.update = () => {
            this.spectrum.context.clearRect(0, 0, this.spectrum.width, this.spectrum.height)

            for (let i = 0; i < this.analyserNode.fftSize; i++) {
                const floatTimeDomainValue = this.floatTimeDomainData[i]
                const byteFrequencyValue = this.byteFrequencyData[i]
                const normalizeByteFrequencyValue = byteFrequencyValue / 255

                const x = i
                const y = this.spectrum.height - (normalizeByteFrequencyValue * this.spectrum.height)
                const width = 1
                const height = normalizeByteFrequencyValue * this.spectrum.height

                this.spectrum.context.fillRect(x, y, width, height)
            }
        }
    }

    getLevels() {
        const bufferLength = this.analyserNode.fftSize
        const levelCount = 8
        const levelBins = Math.floor(bufferLength / levelCount)

        const levels = []
        let max = 0
        
        for (let i = 0; i < levelCount; i++) {
            let sum = 0

            for (let j = 0; j < levelBins; j++) {
                sum += this.byteFrequencyData[(i * levelBins) + j]
            }

            const value = sum / levelBins / 256
            levels[i] = value

            if (value > max)
                max = value
        }

        return levels
    }

    getVolume() {
        let sumSquares = 0.0
        for (const amplitude of this.floatTimeDomainData) {
            sumSquares += amplitude * amplitude
        }
        return Math.sqrt(sumSquares / this.floatTimeDomainData.length)
    }

    update() {
        if (!this.ready)
            return

        // Retrieve audio data
        this.analyserNode.getByteFrequencyData(this.byteFrequencyData)
        this.analyserNode.getFloatTimeDomainData(this.floatTimeDomainData)
        
        this.volume = this.getVolume()
        this.levels = this.getLevels()

        // Spectrum
        if (this.spectrum)
            this.spectrum.update()
    }
}
