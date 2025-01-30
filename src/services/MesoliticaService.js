import ProxyService from './ProxyService';

class MesoliticaService {
    async transcribeAudioStream(audioBlob) {
        try {
            // Prepare form data directly from Blob
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm'); // No need for File()
            formData.append('model', 'base'); // Default model
            formData.append('language', 'ms'); // Malay transcription

            // Call ProxyService to handle the request
            const data = await ProxyService.AudioTranscribe(formData);

            console.log('Transcription result:', data);
            return data;
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
    }
}

export default new MesoliticaService();
