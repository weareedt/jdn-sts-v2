import React, { useEffect, useRef, useState } from 'react';
import Microphone from './Microphone.js';

export default function PTT({ setTranscription, setIsPTTActiveRef, isTyping, setIsTyping, isLoading, setIsLoading, isVisible }) {
  const microphoneRef = useRef(null);
  const isPTTActiveRef = useRef(false);
  const [buttonState, setButtonState] = useState('idle');

  const icons = {
    idle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>`,
    recording: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>`,
    processing: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v6l4 2"></path>
            <circle cx="12" cy="12" r="10"></circle>
        </svg>`,
    typing: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v6l4 2"></path>
            <circle cx="12" cy="12" r="10"></circle>
        </svg>`
  };

  useEffect(() => {
    // Add CSS for rotation animation
    const style = document.createElement('style');
    style.textContent = `
            @keyframes spin {
                from { transform: translateX(-50%) rotate(0deg); }
                to { transform: translateX(-50%) rotate(360deg); }
            }
        `;
    document.head.appendChild(style);

    // Initialize microphone
    microphoneRef.current = new Microphone(setTranscription);

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && isPTTActiveRef.current) {
        isPTTActiveRef.current = false;
        if (microphoneRef.current) {
          microphoneRef.current.stopRecording();
        }
        setButtonState('idle');
        console.log('Push-to-talk deactivated due to page visibility change');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (microphoneRef.current && microphoneRef.current.audioContext) {
        microphoneRef.current.audioContext.close();
      }
    };
  }, []);

  const handleMouseDown = () => {
    if (!isPTTActiveRef.current && microphoneRef.current && !microphoneRef.current.isProcessing && !isTyping && !isLoading) {
      isPTTActiveRef.current = true;
      microphoneRef.current.startRecording();
      setButtonState('recording');
      console.log('Push-to-talk activated');
      setIsPTTActiveRef(true);
    }
  };

  const handleMouseUp = () => {
    if (isPTTActiveRef.current && microphoneRef.current) {
      isPTTActiveRef.current = false;
      microphoneRef.current.stopRecording();
      setButtonState('processing');
      console.log('Push-to-talk deactivated');
      setTimeout(() => {
        if (!isPTTActiveRef.current) {
          setButtonState('idle');
        }
      }, 100);
    }
  };

  const handleMouseLeave = () => {
    if (isPTTActiveRef.current && microphoneRef.current) {
      isPTTActiveRef.current = false;
      microphoneRef.current.stopRecording();
      setButtonState('processing');
      console.log('Push-to-talk deactivated');
      setTimeout(() => {
        if (!isPTTActiveRef.current) {
          setButtonState('idle');
        }
      }, 100);
    }
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
        return {
          ...baseStyles,
          backgroundColor: '#7C3AED',
        };
      case 'typing':
        return {
          ...baseStyles,
          backgroundColor: '#7C3AED',
        };
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
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      style={getButtonStyles()}
      dangerouslySetInnerHTML={{ __html: icons[buttonState] }}
      disabled={buttonState === 'typing' || buttonState === 'processing' || isTyping || isLoading}
    />
  );
}