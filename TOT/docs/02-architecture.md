# Architecture Documentation

## Core Components

### Experience Layer

The application is built around a central `Experience` class that manages the 3D environment:

#### Core Components
- **Camera**: Custom perspective camera management
- **Renderer**: WebGL renderer with custom configuration
- **World**: Scene management and object initialization
- **Resources**: Asset loading and management
- **Time**: Animation and timing utilities
- **Sizes**: Viewport and responsive handling
- **Debug**: Tweakpane-based debugging interface
- **Microphone**: Audio input processing

#### Interactive Visualization

The main visual element is an audio-reactive sphere:

```javascript
class Sphere {
    // Core components
    - Geometry: High-resolution sphere (512x512 segments)
    - Material: Custom shader material
    - Lights: Dual-light system (orange and blue)
    
    // Audio Reactivity
    - Volume variations
    - Frequency analysis (low, medium, high)
    - Dynamic distortion
    - Fresnel effects
    
    // Animation
    - Time-based movement
    - Spherical offset calculations
    - Shader-based deformation
}
```

#### Shader System
```glsl
// Vertex Shader Features
- Displacement mapping
- Distortion effects
- Position calculations

// Fragment Shader Features
- Dual light processing
- Fresnel calculations
- Color blending
```

#### Audio Integration
- Real-time audio level analysis
- Frequency band separation
- Dynamic parameter modulation
- Smooth transitions between states

#### Push-to-Talk System
```javascript
// PTT Component Features
- Real-time microphone control
- Visual state management (idle, recording, processing)
- Animated UI feedback
- Page visibility handling
- Audio context lifecycle management

// State Management
- Button states: idle, recording, processing
- Mouse interaction handling
- Microphone reference management
- Transcription updates

// UI Components
- Animated microphone button
- SVG icons for different states
- Dynamic styling based on state
- Visual feedback for user actions
```

#### Component Integration
- React components for UI elements
- Event handling for audio interactions
- State management for recording status
- Microphone integration with 3D visualization

### Service Layer

Multiple services handle different aspects of the application:

- **AudioService**: Web Audio API integration for sound processing
- **ElevenLabsService**: Text-to-speech functionality integration
- **MesoliticaService**: Custom service integration for specialized features
- **ProxyService**: API proxy handling for secure communication

### Utility Layer

Common utilities that support the application:

- **EventEmitter**: Custom event handling system
- **Loader**: Asset loading management
- **Stats**: Performance monitoring
- **Time**: Time-based animations and updates

## Data Flow

1. User interactions trigger events in the Experience layer
2. Events are processed through relevant services
3. Results are rendered in the 3D environment
4. Audio feedback is provided through the AudioService

## Technical Implementation

### Shader System
```
src/Experience/shaders/
├── partials/           # Reusable shader components
│   ├── perlin3d.glsl   # 3D noise generation
│   └── perlin4d.glsl   # 4D noise generation
└── sphere/            # Sphere-specific shaders
    ├── fragment.glsl   # Fragment shader for sphere rendering
    └── vertex.glsl     # Vertex shader for sphere transformations
```

### Asset Management

- **Basis Universal**: Texture compression for optimal loading
- **Draco**: 3D mesh compression for efficient geometry transfer
- **Custom Loaders**: Specialized asset loading for different file types

## Development Environment

### Build Process

1. Development server with hot reload
2. HTTPS support for secure development
3. Asset optimization pipeline
4. Production build with compression

### Performance Optimization

- Shader compilation optimization
- Asset compression and lazy loading
- Memory management best practices
- WebGL state optimization
