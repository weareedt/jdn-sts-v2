import React, { useEffect, useRef, useState } from 'react';
import Experience from './Experience.js';
import ProxyService from '../services/ProxyService.js';
import AudioService from '../services/AudioService.js';

export default function ExperienceWrapper() {
  const containerRef = useRef(null);
  const experienceRef = useRef(null);
  const [transcription, setTranscription] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (containerRef.current && !experienceRef.current) {
      experienceRef.current = new Experience({
        targetElement: containerRef.current,
        setTranscription: setTranscription,
      });
    }

    return () => {
      if (experienceRef.current) {
        experienceRef.current.destroy();
        experienceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const queryLLM = async () => {
      if (!transcription.trim()) return;

      try {
        setError('');
        // Get LLM response
        const response = await ProxyService.post(transcription);
        console.log('LLM response:', response.response.text);
        setLlmResponse(response.response.text);

        // Get TTS audio for the response
        const ttsResponse = await fetch('http://localhost:3001/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: response.response.text }),
        });

        console.log('TTS response:', ttsResponse);

        const { audio } = await ttsResponse.json();
        await AudioService.playAudio(audio);
      } catch (error) {
        console.error('LLM query error:', error);
        setError(error.message);
      }
    };

    queryLLM();
  }, [transcription]);

  return (
    <>
      <>
        <div ref={containerRef}></div>
        <div
          className="transcript"
          style={{
            position: 'fixed',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          {transcription}
        </div>
        <div
          className="response"
          style={{
            position: 'fixed',
            background: 'rgba(255, 255, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          {llmResponse}
        </div>
      </>
    </>
  );
}
