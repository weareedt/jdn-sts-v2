# Text Input Flow - Step 1: Clicking the "Show" Button

**File:** `ExperienceWrapper.js`  
**Method:** `toggleVisibility`

## Details

- The user clicks the "show" button in the UI.
- The button’s `onClick` handler calls the `toggleVisibility` function.
- This function toggles the `isVisible` state from `false` to `true`.
- As a result, the `<TextInput>` component is rendered.

# Text Input Flow - Step 2: Rendering the Text Input Component

**File:** `ExperienceWrapper.js`  
**Component Rendered:** `<TextInput />`

## Details

- The JSX in `ExperienceWrapper.js` conditionally renders `<TextInput>` based on the `isVisible` state.
- When `isVisible` is `true`, `<TextInput>` mounts and displays a text area and a send button.
- Props such as `setTranscription`, `setLlmResponse`, `isTyping`, `setIsTyping`, `isLoading`, and `setIsLoading` are passed to `<TextInput>`.

# Text Input Flow - Step 3: User Enters Text & Triggers Send

**File:** `TextInput.js`  
**Key Methods:** `handleKeyPress` and `sendMessage`

## Details

- The user types a message into the `<textarea>` element.
- The message is stored locally using the React `useState` hook.
- The send action is triggered by:
    - Pressing the **Enter** key (handled by `handleKeyPress`), which then calls `sendMessage()`.
    - Clicking the send button, which directly calls `sendMessage()`.

# Text Input Flow - Step 4: Processing and Sending the Message

**File:** `TextInput.js`  
**Method:** `sendMessage`

## Details

1. **Input Validation & Loading:**
    - Verifies that the message is not empty and that no other process (typing or loading) is active.
    - Sets `isLoading` to `true` to prevent duplicate sends.

2. **Audio Handling:**
    - Calls `AudioService.stopAudio()` to stop any currently playing audio.

3. **State Update:**
    - Updates the transcription by calling `setTranscription(message)`.

4. **LLM Request:**
    - Sends the message to the backend via `ProxyService.post(message)`.
    - Awaits and retrieves the LLM response.

# Text Input Flow - Step 5: Audio Playback & Typewriter Effect

**File:** `TextInput.js`

## Details

1. **TTS Request:**
    - After receiving the LLM response, a request is made to the TTS endpoint using `ProxyService.TTS(response.response.text)`.

2. **Audio Playback:**
    - Plays the TTS audio by calling `AudioService.playAudio(audio)`.
    - Retrieves the duration of the audio to calculate the typing speed.

3. **Typewriter Effect:**
    - An inline `typeWriter` function animates the response text, displaying one character at a time based on the calculated average character time.


# Text Input Flow - Step 6: Backend Communication

**File:** `ProxyService.js`

## Details

- **Method `post(message)`:**
    - Sends a POST request to the LLM API endpoint with a JSON payload containing the message and a session ID.
    - Returns a JSON response containing the LLM reply text.

- **Method `TTS(message)`:**
    - Sends a POST request to the TTS API endpoint with the response text.
    - Returns a JSON response containing a base64-encoded audio string.

# Text Input Flow - Summary

## Overview

1. **User Action:**
    - Clicks the "show" button, which calls `toggleVisibility` in `ExperienceWrapper.js` and renders `<TextInput>`.

2. **User Input:**
    - Enters text and triggers `sendMessage` in `TextInput.js` (via Enter key or clicking the send button).

3. **Message Processing:**
    - Stops any playing audio using `AudioService.stopAudio()`.
    - Updates the transcription state and sends the message to the backend with `ProxyService.post(message)`.
    - Initiates a typewriter effect to display the response text gradually.

4. **Audio Playback:**
    - Requests and plays TTS audio via `AudioService.playAudio(audio)`, synchronizing with the typewriter effect.

5. **Backend Communication:**
    - Uses `ProxyService` to communicate with both the LLM and TTS APIs.

This completes the Text Input Flow.
