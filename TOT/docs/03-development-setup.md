# Development Setup Guide

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn package manager
- Modern web browser with WebGL support
- SSL certificate for local HTTPS (optional, setup script provided)

## Initial Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure required environment variables:

```bash
# Mesolitica API Configuration
MESOLITICA_API_KEY=your_mesolitica_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# JDN AI Service Configuration
JDN_API_ENDPOINT=https://aishah.jdn.gov.my/api/forward_message
JDN_API_TOKEN=your_jwt_token

# Server Configuration
PORT=3001 # Backend server port
```

Important Notes:
- Never commit the `.env` file to version control
- Keep API keys and tokens secure
- Different environments (development/production) may require different configurations
- Some services may require additional setup or registration

## Development Server

The project uses two development servers:

### Frontend Development Server
Start the frontend development server:
```bash
npm run dev
# or
yarn dev
```

Features:
- Automatic port selection (default 8080)
- Hot module replacement
- Source maps
- File watching
- Auto-reload on file changes
- Accessible via localhost and local IP
- Error overlay for debugging

### Backend Server
Start the backend server:
```bash
npm run server
# or
yarn server
```

Features:
- Express server running on port 3001
- Handles API proxying
- Text-to-speech processing
- Message forwarding

## SSL Setup (Optional)

For HTTPS development:

1. Run the certbot setup script:
```bash
./server/setup-certbot.sh
```

2. Trust the generated certificates in your system keychain

## Build Process

### Development Build
```bash
npm run build:dev
# or
yarn build:dev
```

### Production Build
```bash
npm run build
# or
yarn build
```

The production build includes:
- Minified code
- Optimized assets
- Compressed textures
- Production-ready bundle

## Common Development Tasks

### Asset Management

Place new assets in appropriate directories:
- 3D models: `public/assets/models/`
- Textures: `public/assets/textures/`
- Fonts: `public/fonts/`

### Shader Development

1. Create new shaders in `src/Experience/shaders/`
2. Follow the existing pattern:
   - Separate vertex and fragment shaders
   - Use partials for shared code
   - Include proper uniforms

### Service Integration

1. Create new service in `src/services/`
2. Follow the service pattern:
   - Extend base service class
   - Implement required methods
   - Add error handling
   - Document API endpoints

## Testing

Currently, the project relies on manual testing through the development environment. Key areas to test:

- WebGL rendering
- Audio processing
- Service integration
- Cross-browser compatibility
- Mobile responsiveness

## Performance Monitoring

Use the built-in Stats utility:
1. Enable stats in development:
```javascript
import Stats from './Utils/Stats'
const stats = new Stats()
```

2. Monitor:
- FPS
- Memory usage
- Draw calls
- WebGL state

## Troubleshooting

Common issues and solutions:

1. WebGL not working
   - Check browser compatibility
   - Verify GPU drivers
   - Enable hardware acceleration

2. Audio issues
   - Check browser permissions
   - Verify audio context state
   - Test microphone access

3. Build failures
   - Clear node_modules and reinstall
   - Check for conflicting dependencies
   - Verify environment variables
