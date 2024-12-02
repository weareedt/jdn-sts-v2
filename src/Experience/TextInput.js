import React, { useState } from 'react';
import ProxyService from '../services/ProxyService.js';
import AudioService from '../services/AudioService.js';

export default function TextInput({ setTranscription, setLlmResponse }) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;

        try {
            setIsLoading(true);
            
            // Update transcription with the text input
            setTranscription(message);

            // Get LLM response
            const response = await ProxyService.post(message);
            console.log('Textinput LLM response:', response.response.text);
            setLlmResponse(response.response.text);

            // Get TTS audio for the response
            const ttsResponse = await fetch('https://jdn-relay.hiroshiaki.online:3001/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: response.response.text }),
            });

            const { audio } = await ttsResponse.json();
            await AudioService.playAudio(audio);

            // Clear input after successful send
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            sendMessage();
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Apakah itu pendigitalan?"
                disabled={isLoading}
                style={{
                    padding: '12px 16px',
                    borderRadius: '25px',
                    border: '2px solid #8B5CF6',
                    backgroundColor: isLoading ? '#2a2a2a' : '#1a1a1a',
                    color: 'white',
                    fontSize: '28px',
                    width: '600px',
                    outline: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'text',
                }}
            />
            <button
                onClick={sendMessage}
                disabled={isLoading}
                style={{
                    width: '50px',
                    height: '50px',
                    padding: 0,
                    backgroundColor: isLoading ? '#6D28D9' : '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    animation: isLoading ? 'spin 2s linear infinite' : 'none',
                }}
                onMouseOver={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#7C3AED';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }
                }}
                onMouseOut={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#8B5CF6';
                        e.currentTarget.style.transform = 'scale(1)';
                    }
                }}
                onMouseDown={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#6D28D9';
                        e.currentTarget.style.transform = 'scale(0.95)';
                    }
                }}
                onMouseUp={(e) => {
                    if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#8B5CF6';
                        e.currentTarget.style.transform = 'scale(1)';
                    }
                }}
            >
                {isLoading ? (
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
                        <path d="M12 6v6l4 2"></path>
                        <circle cx="12" cy="12" r="10"></circle>
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
