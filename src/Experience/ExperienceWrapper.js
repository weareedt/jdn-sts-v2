import React, { useRef, useState, useEffect } from 'react';
import Experience from './Experience.js';
import ProxyService from '../services/ProxyService.js';
import AudioService from '../services/AudioService.js';
import TextInput from './TextInput.js';
import PTT from './PTT.js';

export default function ExperienceWrapper() {
  const containerRef = useRef(null);
  const experienceRef = useRef(null);
  const [transcription, setTranscription] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [error, setError] = useState('');
  const [isPTTActiveRef, setIsPTTActiveRef] = useState(false);

  // Initialize Experience on component mount
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

  // Handle LLM query when transcription changes
  useEffect(() => {
    const queryLLM = async () => {
      if (!transcription.trim()) return;

      if (isPTTActiveRef) {
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

          setIsPTTActiveRef(false);
        } catch (error) {
          console.error('LLM query error:', error);
          setError(error.message);
        }
      }
    };

    queryLLM();
  }, [transcription]);

  return (
    <>
      <div ref={containerRef}></div>
      {llmResponse && (
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
      )}
      {llmResponse && (
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
      )}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '30px',
          zIndex: 1000,
        }}
      >
        <TextInput
          setTranscription={setTranscription}
          setLlmResponse={setLlmResponse}
        />
        <PTT
          setTranscription={setTranscription}
          setIsPTTActiveRef={setIsPTTActiveRef}
        />
      </div>
    </>
  );
}
