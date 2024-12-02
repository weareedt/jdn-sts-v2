export default {
    mesolitica: {
        apiUrl: 'https://api.mesolitica.com/audio/transcriptions',
        // webpack will replace process.env with actual values during build
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndlYXJlZWR0QGdtYWlsLmNvbSIsInV1aWQiOiIwNmRmYmY3My1mMjIzLTQ1MDgtYTY5OC1kMTExMWM2YTI4YjEifQ.Iz5z2MaI9SI7w8KaNzBEzTZ3HizmZT8jNHBecCh9Mdc',
        defaultOptions: {
            model: 'base',
            language: 'ms',
            chunking_method: 'naive',
            vad_method: 'silero',
            minimum_silent_ms: 200,
            minimum_trigger_vad_ms: 1500,
            reject_segment_vad_ratio: 0.9,
            enable_diarization: 0,
            speaker_similarity: 0.5,
            speaker_max_n: 5,
            stream: 1
        }
    }
}
