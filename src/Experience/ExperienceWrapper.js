import React, { useRef, useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
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
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Track the typewriter effect
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  // Debugging: Log transcription whenever it changes
  useEffect(() => {
    console.log('Updated transcription:', transcription);
  }, [transcription]);

  // Prevent user zooming (scroll/pinch) interactions
  useEffect(() => {
    const handleWheel = (e) => e.preventDefault(); // Disable scroll zoom
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // Disable pinch zoom
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

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
      console.log('queryLLM: Function called');

      // Check if transcription is empty
      if (!transcription.trim()) {
        console.log('queryLLM: Transcription is empty, exiting function');
        return;
      }

      // Ensure the Push-to-Talk (PTT) state is active
      if (isPTTActiveRef) {
        console.log('queryLLM: PTT is active, starting LLM query');
        try {
          // Clear previous errors
          setError('');
          setIsLoading(true);
          await AudioService.stopAudio();
          console.log('queryLLM: Cleared previous error state');

          // Step 1: Query LLM for a response
          console.log(`queryLLM: Sending transcription to LLM: "${transcription}"`);
          const response = await ProxyService.post(transcription);

          if (!response || !response.response || !response.response.text) {
            throw new Error('Invalid LLM response structure');
          }

          console.log('queryLLM: LLM response received:', response.response.text);

          const typeWriter = (text) => {
            let index = 0;
            setIsTyping(true); // Set typing state to true
            const interval = setInterval(() => {
              if (index < text.length) {
                setLlmResponse((prev) => prev + text[index]);
                index++;
              } else {
                clearInterval(interval);
                setIsTyping(false); // Typing complete
              }
            }, 50);
          };

          setLlmResponse(''); // Clear previous response
          typeWriter(response.response.text);

          // Step 2: Fetch TTS audio for the LLM response
          console.log(`queryLLM: Fetching TTS audio for response: "${response.response.text}"`);
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

          if (!ttsResponse.ok) {
            const errorDetails = await ttsResponse.json().catch(() => ({}));
            console.error('queryLLM: TTS service error response:', errorDetails);
            throw new Error(`TTS service error: ${errorDetails.message || 'Unknown error occurred'}`);
          }

          console.log('queryLLM: TTS fetch response received');

          // Step 3: Parse the TTS response
          const { audio } = await ttsResponse.json();
          if (!audio) {
            throw new Error('TTS response missing audio data');
          }
          console.log('queryLLM: TTS audio data extracted');

          // Step 4: Play the TTS audio
          console.log('queryLLM: Playing TTS audio');
          await AudioService.playAudio(audio);

          // Reset PTT state
          console.log('queryLLM: Resetting PTT state');
          setIsPTTActiveRef(false);
        } catch (error) {
          console.error('queryLLM: Error occurred during LLM query or TTS handling:', error);
          toast.error('An error occurred while sending the message. Please try again.');
          setError(
            error.message ||
            'An unexpected error occurred while processing your request. Please try again later.'
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('queryLLM: PTT is not active, skipping query');
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
          height: '100%',
          zIndex: 1,
          backgroundColor: '#000',
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
            color: 'white',
            padding: '10px',
            fontSize: '1rem',
            zIndex: 1000,
            textAlign: 'center',
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
        <div
          className="response"
          style={{
            position: 'fixed',
            top: '70vh',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '2000px',
            height: 'auto',
            maxHeight: '60vh',
            overflowY: 'auto',
            color: 'white',
            fontSize: '1.2rem',
            lineHeight: '1.6',
            textAlign: 'center',
            borderRadius: '10px',
            zIndex: 1000,
          }}
        >
          {llmResponse}
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          top: '80vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: 1000,
        }}
      >
        {isVisible && (
          <TextInput
            setTranscription={setTranscription}
            setLlmResponse={setLlmResponse}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        <PTT
          setTranscription={setTranscription}
          setIsPTTActiveRef={setIsPTTActiveRef}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isVisible={isVisible}
        />

        <button
          onClick={toggleVisibility}
          style={{
            position: 'fixed',
            right: '20px',
            top: 'calc(50% + 20px)',
            width: '65px',
            height: '65px',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
            zIndex: 1000,
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
          >
            <path
              d="M3 12c0 4.97 4.03 9 9 9 1.66 0 3.22-.41 4.58-1.13L21 21l-1.87-4.42C20.59 15.22 21 13.66 21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9z"></path>
          </svg>
        </button>
      </div>
      <ToastContainer />
    </>
  );
}
