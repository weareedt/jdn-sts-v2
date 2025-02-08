import React, { useEffect, useRef, useState } from 'react';
import Microphone from './Microphone.js';

export default function PTT({ setTranscription, setIsPTTActiveRef, isTyping, setIsTyping, isLoading, setIsLoading, isVisible }) {
  const microphoneRef = useRef(null);
  const isPTTActiveRef = useRef(false);
  const [buttonState, setButtonState] = useState('idle');
  const touchStartRef = useRef(null);
  const startTimeRef = useRef(null);

  const icons = {
    idle: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    ),
    recording: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    ),
    processing: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6v6l4 2"></path>
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    ),
    typing: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6v6l4 2"></path>
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    )
  };

  useEffect(() => {
    microphoneRef.current = new Microphone(setTranscription);
    return () => {
      if (microphoneRef.current && microphoneRef.current.audioContext) {
        microphoneRef.current.audioContext.close();
      }
    };
  }, []);

  const handleMouseDown = () => {
    startTimeRef.current = new Date().getTime(); // Record start time
    isPTTActiveRef.current = true;
    microphoneRef.current.startRecording();
    setButtonState('recording');
    console.log('Mouse pressed: Push-to-talk activated');
    setIsPTTActiveRef(true);
  };

  const handleMouseUp = () => {
    if (isPTTActiveRef.current && microphoneRef.current) {
      isPTTActiveRef.current = false;
      const recordingDuration = new Date().getTime() - startTimeRef.current;

      if (recordingDuration < 500) {  // Ignore if recording is too short
        console.log("Recording too short, ignoring.");
        setButtonState('idle');
        return;
      }

      microphoneRef.current.stopRecording();
      setButtonState('idle');
      console.log('Mouse released: Push-to-talk deactivated');

      setTimeout(() => {
        if (!isPTTActiveRef.current) {
          setButtonState('idle');
        }
      }, 100);
    }
  };

  const startHold = () => {
    console.log('Touch start: Button pressed');
    handleMouseDown();
  };

  const stopHold = () => {
    console.log('Touch end: Button released');
    handleMouseUp();
  };

  const getButtonStyles = () => {
    const baseStyles = {
      position: 'fixed',
      right: '20px',
      top: 'calc(38% - 80px)',
      width: '65px',
      height: '65px',
      backgroundColor: '#8B5CF6',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: buttonState === 'typing' || buttonState === 'processing' || isTyping || isLoading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
      transition: 'all 0.3s ease',
      zIndex: 1000,
    };

    switch (buttonState) {
      case 'recording':
        return { ...baseStyles, backgroundColor: '#6D28D9', transform: 'scale(0.95)' };
      case 'processing':
        return { ...baseStyles, backgroundColor: '#7C3AED' };
      case 'typing':
        return { ...baseStyles, backgroundColor: '#7C3AED' };
      default:
        return baseStyles;
    }
  };

  useEffect(() => {
    if (isTyping || isLoading) {
      setButtonState('typing');
    } else {
      setButtonState('idle');
    }
  }, [isTyping, isLoading, isVisible]);

  return (
    <button
      className="ptt-button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      onTouchCancel={stopHold}
      onContextMenu={(e) => e.preventDefault()} // Prevent right-click issues
      style={getButtonStyles()}
    >
      {icons[buttonState]} {/* Render the icon based on the button state */}
    </button>
  );
}
