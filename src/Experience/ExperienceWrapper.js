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
  const [isGreeting, setIsGreeting] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

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
          const ttsResponse = await fetch('https://jdn-relay.hiroshiaki.online:3001/api/tts', {
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

  // Hide greeting when transcription and response are available
  useEffect(() => {
    if (transcription || llmResponse) {
      setIsGreeting(false);
    }
  }, [transcription, llmResponse]);

  // Toggle visibility of text input and buttons
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <div ref={containerRef}></div>
      {isGreeting && (
        <div
          className="greeting"
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '38px',
            zIndex: 1000,
            textAlign: 'center',
          }}
        >
          Hi, Saya Terra. Ada apa-apa saya boleh bantu?
        </div>
      )}
      {llmResponse && (
        <div
          className="transcript"
          style={{
            position: 'fixed',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '38px',
            maxHeight: '150px',
            maxWidth:'1000px',
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
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '38px',
            maxHeight: '150px',
            maxWidth:'1000px',
          }}
        >
          {llmResponse}
        </div>
      )}
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '40px',
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
