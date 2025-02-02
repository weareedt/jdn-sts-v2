# Record Button Flow - Step 1: Clicking the Record Button

**File:** `PTT.js`  
**Relevant Method:** `handleMouseDown`

## Details

- When the user presses (mouse down) on the record button, the `handleMouseDown` function is triggered.
- It checks that:
    - No recording is already active.
    - The microphone instance is available and not busy processing.
- If these conditions are met, it:
    - Sets `isPTTActiveRef.current` to `true`.
    - Calls `microphoneRef.current.startRecording()` to begin audio capture.
    - Updates the button state to `"recording"`.
    - Calls `setIsPTTActiveRef(true)` to update any parent state.

# Record Button Flow - Step 2: Starting the Recording

**File:** `Microphone.js`  
**Method:** `startRecording()`

## Details

- **Preconditions:**
    - Checks that the microphone is ready and a recorder instance exists.
    - Verifies that no recording is already in progress.
- **Actions:**
    - Sets `this.isRecording` to `true`.
    - Initiates recording by calling `this.recorder.startRecording()` (using RecordRTC).
- A log message ("Recording started") confirms that recording has begun.


# Record Button Flow - Step 3: Stopping the Recording

**File:** `PTT.js`  
**Relevant Methods:** `handleMouseUp` (and optionally `handleMouseLeave`)

## Details

- When the user releases the record button (mouse up or mouse leave), `handleMouseUp` is triggered.
- The function:
    - Checks that a recording is active using `isPTTActiveRef.current`.
    - Sets `isPTTActiveRef.current` to `false`.
    - Calls `microphoneRef.current.stopRecording()` to stop the recording.
    - Changes the button state to `"processing"`.
    - After a short delay, resets the button state to `"idle"`.

# Record Button Flow - Step 4: Processing the Recording

**File:** `Microphone.js`  
**Methods:** `stopRecording()` and `processRecording(blob)`

## Details

- **Stopping the Recording:**
    - `stopRecording()` verifies that a recording is in progress.
    - It stops the recorder and retrieves the recorded audio as a blob via `this.recorder.getBlob()`.

- **Processing the Blob:**
    - If the blob is valid and non-empty, `processRecording(blob)` is called.
    - This method:
        - Sets `this.isProcessing` to `true`.
        - Calls `MesoliticaService.transcribeAudioStream(blob)` to obtain the transcription.
        - Checks the transcription for banned words; if any are found, it clears the transcription.
        - Otherwise, it stores and displays the transcription using `this.setTranscription()`.
        - Finally, it resets the processing state and reinitializes the recorder by calling `setupRecording()`.

# Record Button Flow - Step 5: Transcription Service

**File:** `MesoliticaService.js`  
**Method:** `transcribeAudioStream(audioBlob)`

## Details

- **Preparation:**
    - Creates a `FormData` object.
    - Appends the audio blob (with key `'file'` and name `'audio.webm'`), along with parameters for `model` and `language`.

- **Request:**
    - Calls `ProxyService.AudioTranscribe(formData)` to send the data to the transcription API.

- **Response:**
    - Logs and returns the transcription result for further processing.

# Record Button Flow - Step 6: Backend Transcription Request

**File:** `ProxyService.js`  
**Method:** `AudioTranscribe(formData)`

## Details

- Sends a POST request to the transcription API endpoint with the provided `formData`.
- Checks the HTTP response status:
    - If successful, returns a JSON object containing the transcription.
    - In case of error, logs the error and throws an exception.

# Record Button Flow - Summary

## Overview

1. **User Action:**
    - The user presses the record button in the PTT component, triggering `handleMouseDown` in `PTT.js`.

2. **Starting Recording:**
    - `Microphone.startRecording()` is called to begin capturing audio.

3. **Stopping Recording:**
    - When the button is released (mouse up/leave), `handleMouseUp` calls `Microphone.stopRecording()` to stop recording and retrieve the audio blob.

4. **Processing the Recording:**
    - The recorded blob is processed via `processRecording(blob)` in `Microphone.js`, which sends it for transcription.

5. **Transcription:**
    - The audio is sent to the transcription service using `MesoliticaService.transcribeAudioStream(blob)` and then to the backend via `ProxyService.AudioTranscribe(formData)`.

6. **UI Updates:**
    - The transcription result is passed back via `setTranscription`, and the button’s state updates from `"recording"` to `"processing"` and finally to `"idle"`.

This completes the Record Button Flow.
