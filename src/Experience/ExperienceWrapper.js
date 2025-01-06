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
          const ttsResponse = await fetch(
            'https://jdn-relay.hiroshiaki.online:3001/api/tts',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text: response.response.text }),
            }
          );

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
      <div 
        ref={containerRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height:  '100%',
          zIndex: 1,
          backgroundColor: '#000'
        }}
      ></div>
      {isGreeting && (
        <p
          className="greeting"
          style={{
            position: 'fixed',
            top: '25vh',
            left: 0,
            width: '100%',
            height: '10vh',
            display: 'block',
            overflowY: 'auto',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '1rem',
            zIndex: 1000,
            textAlign: 'center',
            overflowY: 'auto',
          }}
        >
          Hi, Saya Terra. Ada apa-apa saya boleh bantu?
        </p>
      )}
      {llmResponse && (
        <p
          className="greeting"
          style={{
            position: 'fixed',
            top: '25vh',
            left: 0,
            width: '100%',
            height: '10vh',
            display: 'block',
            overflowY: 'auto',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '1rem',
            zIndex: 1000,
            textAlign: 'center',
            overflowY: 'auto',
          }}
        >
          {transcription}
        </p>
      )}
      {llmResponse && (
        <p
          className="response"
          style={{
            position: 'fixed',
            top: '65vh',
            right: 0,
            width: '100%',
            height: '10vh',
            display: 'flex',
            overflowY: 'auto',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '1rem',
            zIndex: 1000,
            textAlign: 'center',
            overflowY: 'auto',
          }}
        >
          {llmResponse}
        </p>
      )}
      <div
        style={{
          position: 'absolute',
          top: '75vh',
          left: 0,
          width: '100%',
          height: '20vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 20px',
          gap: '20px',
          zIndex: 1000,
          borderRadius: '12px',
        }}
      >
        {isVisible && (
          <TextInput
            setTranscription={setTranscription}
            setLlmResponse={setLlmResponse}
          />
        )}
        <PTT
          setTranscription={setTranscription}
          setIsPTTActiveRef={setIsPTTActiveRef}
        />

        <button
          onClick={toggleVisibility}
          style={{
            position: 'absolute',
            bottom: '25px',
            right: '3vh',
            width: '50px',
            height: '50px',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12c0 4.97 4.03 9 9 9 1.66 0 3.22-.41 4.58-1.13L21 21l-1.87-4.42C20.59 15.22 21 13.66 21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9z"></path>
          </svg>
        </button>
      </div>
    </>
  );
}
