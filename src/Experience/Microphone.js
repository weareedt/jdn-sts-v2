import Experience from './Experience.js'
import MesoliticaService from '../services/MesoliticaService.js'
import RecordRTC from 'recordrtc'

export default class Microphone {
    constructor(setTranscription) {
        this.experience = Experience.instance
        this.debug = this.experience.debug
        this.ready = false
        this.volume = 0
        this.levels = []
        this.isRecording = false
        this.isProcessing = false
        this.recorder = null
        this.recordingInterval = null
        this.transcription = ''
        this.setTranscription = setTranscription

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

    init() {
        this.audioContext = new AudioContext()
        this.mediaStreamSourceNode = this.audioContext.createMediaStreamSource(this.stream)
        this.analyserNode = this.audioContext.createAnalyser()
        this.analyserNode.fftSize = 256
        this.mediaStreamSourceNode.connect(this.analyserNode)
        this.floatTimeDomainData = new Float32Array(this.analyserNode.fftSize)
        this.byteFrequencyData = new Uint8Array(this.analyserNode.fftSize)
        this.ready = true
    }

    setupRecording() {
        // Configure RecordRTC
        this.recorder = new RecordRTC(this.stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=opus',
            recorderType: RecordRTC.StereoAudioRecorder,
            numberOfAudioChannels: 1,
            desiredSampRate: 16000,
            timeSlice: 5000,
            ondataavailable: async (blob) => {
                const bannedWord =[
                    'Terima kasih kerana menonton', 
                    'saya akan mencuba untuk melakukan ini',
                    'Fuck',
                    'Saya akan membunuh anda',
                ];

                if (blob && blob.size > 0 && !this.isProcessing) {
                    try {
                        this.isProcessing = true
                        this.pauseRecording()
                        
                        const transcription = await MesoliticaService.transcribeAudioStream(blob)
                        if (transcription && this.setTranscription) {
                            if(bannedWord.some(word => transcription.toLowerCase().includes(word.toLowerCase()))) {
                                console.log('Banned word detected, clearing transcription and restarting...')
                                this.transcription = ''
                                this.setTranscription('')
                                
                                // Stop current recording
                                this.stopRecording()
                                
                                // Create new recorder instance and start fresh
                                this.setupRecording()
                            } else {
                                this.transcription = transcription
                                console.log('Microphone received transcription:', this.transcription)
                                
                                // Update the transcription state
                                this.setTranscription(prevTranscription => {
                                    return this.transcription
                                })
                            }
                        }
                        
                        // Wait for ProxyService to complete before resuming recording
                        await new Promise(resolve => setTimeout(resolve, 100)) // Small delay to ensure state is updated
                        this.isProcessing = false
                        this.resumeRecording()
                    } catch (error) {
                        console.error('Transcription error:', error)
                        this.isProcessing = false
                        this.resumeRecording()
                    }
                }
            }
        })

        // Start recording
        this.startRecording()
    }

    startRecording() {
        if (!this.isRecording && this.recorder) {
            this.isRecording = true
            this.recorder.startRecording()
            console.log('Recording started')
        }
    }

    stopRecording() {
        if (this.isRecording && this.recorder) {
            this.isRecording = false
            this.recorder.stopRecording(() => {
                const blob = this.recorder.getBlob()
                console.log('Recording stopped, final blob:', blob)
            })
        }
    }

    pauseRecording() {
        if (this.isRecording && this.recorder) {
            this.recorder.pauseRecording()
            console.log('Recording paused')
        }
    }

    resumeRecording() {
        if (this.recorder && !this.isProcessing) {
            this.recorder.resumeRecording()
            console.log('Recording resumed')
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
