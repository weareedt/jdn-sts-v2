# Customization and Debugging Guide

## Customization

### Experience Customization

#### Camera Settings
```javascript
// src/Experience/Camera.js
export default class Camera {
    constructor() {
        this.instance = new THREE.PerspectiveCamera(
            35,  // Field of view
            sizes.width / sizes.height,  // Aspect ratio
            0.1,  // Near plane
            100  // Far plane
        )
    }
}
```

Adjustable parameters:
- Field of view
- Near/far plane distances
- Camera position and rotation
- Look-at target

#### Shader Customization

1. Vertex Shader Modifications (`vertex.glsl`):
```glsl
// Customize vertex transformations
void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // Add custom vertex transformations here
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
```

2. Fragment Shader Modifications (`fragment.glsl`):
```glsl
// Customize visual effects
void main() {
    // Modify color calculations
    vec3 color = vec3(1.0);
    // Add custom effects here
    gl_FragColor = vec4(color, 1.0);
}
```

### Audio Customization

#### Audio Service Configuration
```javascript
// src/services/AudioService.js
const audioConfig = {
    sampleRate: 44100,
    channelCount: 2,
    volume: 1.0
}
```

Customizable audio parameters:
- Sample rate
- Channel configuration
- Volume levels
- Audio processing effects

### UI Customization

#### Text Input Configuration
```javascript
// src/Experience/TextInput.js
const textConfig = {
    fontSize: '16px',
    fontFamily: 'SF-Pro-Display-Regular',
    color: '#ffffff'
}
```

## Debugging

### WebGL Debugging

1. Enable WebGL Inspector:
```javascript
// src/Experience/Experience.js
if (process.env.NODE_ENV === 'development') {
    const GLInspector = require('webgl-inspector')
    GLInspector.enable()
}
```

2. Common WebGL Issues:
- Texture loading failures
- Shader compilation errors
- Memory leaks
- Performance bottlenecks

### Shader Debugging

1. Add Debug Outputs:
```glsl
// In fragment shader
void main() {
    // Debug UV coordinates
    gl_FragColor = vec4(vUv, 0.0, 1.0);
    
    // Debug normals
    gl_FragColor = vec4(normalize(vNormal) * 0.5 + 0.5, 1.0);
}
```

2. Shader Error Handling:
```javascript
try {
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    })
} catch (error) {
    console.error('Shader compilation error:', error)
}
```

### Audio Debugging

1. Audio Context Debugging:
```javascript
// src/services/AudioService.js
class AudioDebugger {
    static logAudioState(audioContext) {
        console.log({
            state: audioContext.state,
            sampleRate: audioContext.sampleRate,
            baseLatency: audioContext.baseLatency
        })
    }
}
```

2. Stream Debugging:
```javascript
audioStream.addEventListener('error', (error) => {
    console.error('Audio stream error:', error)
})
```

### Performance Debugging

1. Enable Performance Monitoring:
```javascript
// src/Experience/Utils/Stats.js
import Stats from 'three/examples/jsm/libs/stats.module.js'

const stats = new Stats()
document.body.appendChild(stats.dom)

// Monitor specific metrics
stats.showPanel(0) // FPS
stats.showPanel(1) // MS
stats.showPanel(2) // MB
```

2. Memory Leak Detection:
```javascript
// Track object allocation
console.log('Geometries in memory:', renderer.info.memory.geometries)
console.log('Textures in memory:', renderer.info.memory.textures)
```

### Service Debugging

1. API Call Debugging:
```javascript
// src/services/ProxyService.js
class DebugProxy {
    static logRequest(endpoint, options) {
        console.log(`[${new Date().toISOString()}] API Request:`, {
            endpoint,
            method: options.method,
            headers: options.headers,
            body: options.body
        })
    }
}
```

2. Response Debugging:
```javascript
async function debugResponse(response) {
    console.log('Response Headers:', response.headers)
    console.log('Response Status:', response.status)
    const data = await response.json()
    console.log('Response Data:', data)
    return data
}
```

## Development Tools

### Browser DevTools

1. WebGL Tab:
- Inspect WebGL context
- Monitor draw calls
- Check texture usage
- Debug shader programs

2. Performance Tab:
- Record performance profiles
- Analyze frame rates
- Identify bottlenecks
- Monitor memory usage

### VS Code Extensions

Recommended extensions for debugging:
- WebGL Shader
- Three.js Snippets
- JavaScript Debugger
- Error Lens

### Console Commands

Useful debug commands:
```javascript
// Check renderer info
console.log(renderer.info)

// Monitor frame rate
console.log('FPS:', 1000 / deltaTime)

// Check memory usage
console.log('Memory:', performance.memory)

// List active event listeners
getEventListeners(window)
```

## Common Issues and Solutions

### WebGL Context Lost
```javascript
canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    console.error('WebGL context lost. Trying to restore...')
    // Implement recovery logic
})
```

### Audio Context Issues
```javascript
// Handle suspended audio context
if (audioContext.state === 'suspended') {
    await audioContext.resume()
    console.log('Audio context resumed')
}
```

### Memory Management
```javascript
// Proper resource disposal
function dispose() {
    geometry.dispose()
    material.dispose()
    texture.dispose()
    renderer.dispose()
}
```

### Performance Optimization
```javascript
// Implement object pooling
class ObjectPool {
    static reuse(object) {
        // Reset object properties
        object.position.set(0, 0, 0)
        object.scale.set(1, 1, 1)
        return object
    }
}
