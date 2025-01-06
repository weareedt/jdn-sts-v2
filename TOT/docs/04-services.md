# Services Documentation

This document details all external services and APIs integrated into the project, including their setup, configuration, and usage patterns.

## Audio Services

### Text-to-Speech Service
Location: `server/index.js`

Purpose: Text-to-speech functionality using ElevenLabs API

Endpoint: `/api/tts`
Method: POST

Configuration:
```javascript
// Environment variables
PORT=3001 // Server port

// ElevenLabs Configuration
Voice ID: "djUbJhnXETnX31p3rgun" // Rachel voice
Model: "eleven_multilingual_v2"
```

Request Body:
```javascript
{
    "text": "Text to convert to speech"
}
```

Response:
```javascript
{
    "audio": "base64EncodedAudioString"
}
```

### Message Forwarding Service
Location: `server/index.js`

Endpoint: `/api/forward_message`
Method: POST

Purpose: Forward messages to JDN AI service (aishah.jdn.gov.my)

Configuration:
```javascript
// Required environment variables
JDN_API_ENDPOINT=https://aishah.jdn.gov.my/api/forward_message
JDN_API_TOKEN=your_jwt_token

// Headers
Content-Type: application/json
Authorization: Bearer ${JDN_API_TOKEN}
```

Request Body:
```javascript
{
    "message": "User message",
    "session_id": "Session identifier"
}
```

Response:
```javascript
{
    // Response from JDN AI service
    // Structure depends on the service response
}
```

Error Handling:
```javascript
{
    "error": "Error message description"
}
```

### Audio Service
Location: `src/services/AudioService.js`

Purpose: Web Audio API integration for sound processing

Features:
- Microphone input handling
- Audio context management
- Real-time audio processing
- Stream management

## External APIs

### Mesolitica Service
Location: `src/services/MesoliticaService.js`

Purpose: Custom service integration for specialized features

Configuration:
```javascript
// Environment variables required
MESOLITICA_API_ENDPOINT=your_endpoint
MESOLITICA_API_KEY=your_api_key
```

Features:
- Custom API integration
- Data processing
- Response handling

### Proxy Service
Location: `src/services/ProxyService.js`

Purpose: API proxy handling for secure communication

Features:
- Request proxying
- CORS handling
- Rate limiting
- Error handling

## Service Architecture

### Base Service Pattern
```javascript
class BaseService {
  constructor() {
    this.baseURL = process.env.API_BASE_URL
    this.headers = {
      'Content-Type': 'application/json'
    }
  }

  async request(endpoint, options) {
    // Common request handling
  }

  handleError(error) {
    // Error handling pattern
  }
}
```

### Service Integration Pattern

1. Service Initialization:
```javascript
import { AudioService } from './services/AudioService'

const audioService = new AudioService({
  // Configuration options
})
```

2. Event Handling:
```javascript
audioService.on('streamStart', () => {
  // Handle stream start
})

audioService.on('streamEnd', () => {
  // Handle stream end
})
```

3. Error Handling:
```javascript
try {
  await audioService.startStream()
} catch (error) {
  // Handle specific service errors
}
```

## Security Considerations

### API Key Management
- All API keys stored in .env file
- Never commit sensitive credentials
- Use environment variables for configuration

### Rate Limiting
- Implement rate limiting for external API calls
- Cache responses when appropriate
- Handle rate limit errors gracefully

### Error Handling
- Implement proper error boundaries
- Log service errors appropriately
- Provide user-friendly error messages

## Service Monitoring

### Health Checks
- Regular service availability checks
- API endpoint monitoring
- Error rate tracking

### Performance Metrics
- Response time monitoring
- API call frequency
- Error rate tracking
- Resource usage monitoring

## Development Guidelines

### Adding New Services

1. Create new service class in `src/services/`
2. Extend BaseService if appropriate
3. Implement required methods
4. Add error handling
5. Document API endpoints
6. Add environment variables
7. Update configuration documentation

### Testing Services

1. Manual Testing:
   - Test all API endpoints
   - Verify error handling
   - Check rate limiting
   - Test with various inputs

2. Integration Testing:
   - Test service interactions
   - Verify event handling
   - Check error propagation

### Deployment Considerations

1. Environment Setup:
   - Configure all required environment variables
   - Verify API access
   - Check rate limits

2. Monitoring:
   - Set up service monitoring
   - Configure error alerting
   - Track usage metrics
