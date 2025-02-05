import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import ProxyService from '../services/ProxyService.js';
import AudioService from '../services/AudioService.js';

export default function TextInput({ setTranscription, setLlmResponse, isTyping, setIsTyping, isLoading, setIsLoading }) {
  const [message, setMessage] = useState('');

  // const sendMessage = async () => {
  //   if (!message.trim() || isLoading || isTyping) return; // Prevent sending during typing or loading
  //
  //   setIsLoading(true);
  //
  //   try {
  //     // Step 1: Stop audio
  //     try {
  //       await AudioService.stopAudio();
  //     } catch (audioStopError) {
  //       console.error('Error stopping audio:', audioStopError);
  //       toast.error('Failed to stop the audio. Please try again.');
  //       return; // Exit early if stopping audio fails
  //     }
  //
  //     // Step 2: Update transcription and get LLM response
  //     let response;
  //     try {
  //       setTranscription(message);
  //       response = await ProxyService.post(message);
  //       console.log('TextInput LLM response:', response.response.text);
  //     } catch (llmError) {
  //       console.error('Error getting LLM response:', llmError);
  //       toast.error('Failed to get the response from the server. Please try again.');
  //       return; // Exit early if LLM response fails
  //     }
  //
  //     // Step 3: Typewriter effect for LLM response
  //     const typeWriter = (text, charTime) => {
  //       let index = 0;
  //       let accumulatedText = '';
  //       setIsTyping(true);
  //       setLlmResponse('');
  //
  //       const interval = setInterval(() => {
  //         if (index < text.length) {
  //           accumulatedText += text[index];
  //           setLlmResponse(accumulatedText);
  //           index++;
  //         } else {
  //           clearInterval(interval);
  //           setTimeout(() => setIsTyping(false), 100);
  //         }
  //       }, charTime); // Use dynamic time per character
  //     };
  //
  //
  //     // Step 4: Fetch TTS audio and play it
  //     try {
  //       const { audio } = await ProxyService.TTS(response.response.text);
  //
  //       // Wait for audio to start and get duration
  //       const duration = await AudioService.playAudio(audio);
  //
  //       // Calculate dynamic typing speed based on speech duration
  //       const text = response.response.text;
  //       const averageCharTime = duration / text.length; // Time per character
  //       typeWriter(text, averageCharTime);
  //
  //     } catch (ttsError) {
  //       console.error('Error fetching or playing TTS audio:', ttsError);
  //       toast.error('Failed to fetch or play the TTS audio. Please try again.');
  //     }
  //
  //
  //     // Step 5: Clear input after successful send
  //     setMessage('');
  //     const textarea = document.querySelector('textarea'); // Select the textarea
  //     if (textarea) {
  //       textarea.style.height = '48px'; // Reset height to initial value
  //     }
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
  //     toast.error('An unexpected error occurred. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const sendMessage = async () => {
    if (!message.trim() || isLoading || isTyping) return; // Prevent sending during typing or loading

    setIsLoading(true);

    try {
      // Step 1: Stop audio
      try {
        await AudioService.stopAudio();
      } catch (audioStopError) {
        console.error('Error stopping audio:', audioStopError);
        toast.error('Failed to stop the audio. Please try again.');
      }

      // Step 2: Update transcription and get LLM response
      let response;
      try {
        setTranscription(message);
        response = await ProxyService.post(message);
        console.log('TextInput LLM response:', response.response.text);
      } catch (llmError) {
        console.error('Error getting LLM response:', llmError);
        toast.error('Failed to get the response from the server. Please try again.');
        return; // Exit early if LLM response fails
      }

      // Step 3: Typewriter effect for LLM response
      const typeWriter = (text, charTime = 50) => { // Default speed if TTS fails
        let index = 0;
        let accumulatedText = '';
        setIsTyping(true);
        setLlmResponse('');

        const interval = setInterval(() => {
          if (index < text.length) {
            accumulatedText += text[index];
            setLlmResponse(accumulatedText);
            index++;
          } else {
            clearInterval(interval);
            setTimeout(() => setIsTyping(false), 100);
          }
        }, charTime);
      };

      // Step 4: Try to Fetch TTS Audio and Play
      try {
        const { audio } = await ProxyService.TTS(response.response.text);

        // Wait for audio to start and get duration
        const duration = await AudioService.playAudio(audio);

        // Calculate dynamic typing speed based on speech duration
        const text = response.response.text;
        const averageCharTime = duration / text.length; // Time per character
        typeWriter(text, averageCharTime);

      } catch (ttsError) {
        console.error('Error fetching or playing TTS audio:', ttsError);
        toast.error('Failed to fetch or play the TTS audio. Displaying text only.');

        // **Fallback: Ensure typewriter effect runs even if TTS fails**
        typeWriter(response.response.text, 50); // Use default speed
      }

      // Step 5: Clear input after successful send
      setMessage('');
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '48px';
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !isTyping) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        bottom: '100px',
        left: '0%',
        width: '100%',
        paddingRight: '1.8vw',
        paddingLeft: '2vw',
      }}
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Apakah itu pendigitalan?"
        disabled={isLoading || isTyping} // Disable input when typing or loading
        style={{
          padding: '12px 16px',
          borderRadius: '25px',
          border: '2px solid #8B5CF6',
          backgroundColor: isLoading ? '#2a2a2a' : '#1a1a1a',
          color: 'white',
          fontSize: '1rem',
          width: 'calc(100% - 85px)', // Adjust width to accommodate the send button and spacing
          outline: 'none',
          height: 'auto', // Allow dynamic height
          minHeight: '48px', // Set a minimum height
          overflow: 'hidden', // Completely remove the scrollbars
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? 'not-allowed' : 'text',
          resize: 'none', // Prevent manual resizing
        }}
        rows={1} // Start with a single row
        onKeyDown={handleKeyPress}
        onInput={(e) => {
          e.target.style.height = 'auto'; // Reset height to allow recalculation
          e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height dynamically to fit content
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          top: '38vh', // Adjusted to viewport height for responsiveness
          width: '10vw', // Responsive width based on viewport width
          height: '10vw', // Responsive height based on viewport width
          maxWidth: '65px', // Ensuring it doesn't get too large on big screens
          maxHeight: '65px',
          minWidth: '45px', // Ensuring it doesn't get too small on small screens
          minHeight: '45px',
          padding: 0,
          backgroundColor: isTyping || isLoading ? '#6D28D9' : '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: isTyping || isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.3s ease',
          animation: isTyping || isLoading ? 'spin 2s linear infinite' : 'none',
        }}
        disabled={isTyping || isLoading} // Disable button when typing or loading
      >
        {isTyping || isLoading ? (
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
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        ) : (
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
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
      </button>
      <style>
        {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}
      </style>
    </div>
  );
}
