# Technical Overview

This document provides a comprehensive overview of the technologies, frameworks, and tools used in the JDN STS V2 WAE project.

## Core Technologies

- **Frontend Framework**: React with Three.js integration
- **3D Graphics**: Three.js (WebGL-based 3D graphics)
- **Build System**: Webpack with custom bundler configuration
- **Development Server**: Express with custom HTTPS implementation
- **Language**: JavaScript (ES6+) with Babel transpilation
- **Styling**: CSS with GLSL shaders

## Key Dependencies

- **React**: UI framework and component system (v18.3.1)
- **Three.js**: 3D graphics rendering (v0.132.2)
- **OpenAI**: AI integration for language processing (v4.73.1)
- **ElevenLabs**: Text-to-speech functionality (v0.18.1)
- **RecordRTC**: Audio recording capabilities (v5.6.2)
- **Tweakpane**: Debug interface (v3.0.5)
- **Express**: Backend server implementation (v4.21.1)
- **Axios**: HTTP client for API requests (v1.7.8)
- **CORS**: Cross-origin resource sharing support (v2.8.5)
- **Node-fetch**: Fetch API for Node.js (v2.7.0)

## Build and Development Tools

- **Webpack**: Module bundling (v5.53.0)
  - clean-webpack-plugin (v4.0.0)
  - copy-webpack-plugin (v9.0.1)
  - html-webpack-plugin (v5.3.2)
  - webpack-dev-server (v4.2.1)
- **Babel**: JavaScript transpilation
  - @babel/core (v7.15.5)
  - @babel/preset-env (v7.15.6)
  - @babel/preset-react (v7.25.9)
- **Loaders**:
  - babel-loader (v8.2.2)
  - css-loader (v6.3.0)
  - file-loader (v6.2.0)
  - glslify-loader (v2.0.0)
  - html-loader (v2.1.2)
  - raw-loader (v4.0.2)
  - style-loader (v3.3.0)

## Deployment

- **Platform**: GitHub Pages
- **Homepage**: https://weareedt.github.io/jdn-sts-v2/
- **Scripts**:
  ```bash
  npm run build     # Build for production
  npm run deploy    # Deploy to GitHub Pages
  npm run dev       # Start development server
  npm run server    # Start backend server
  ```

## Project Structure

```
├── bundler/               # Webpack configuration
├── public/               # Static assets
│   ├── assets/          # Images and media
│   └── fonts/           # Custom fonts
├── server/              # Backend services
├── src/                 # Source code
│   ├── Experience/     # Core 3D experience
│   │   ├── shaders/    # GLSL shader files
│   │   └── Utils/      # Utility classes
│   └── services/       # Frontend services
└── static/             # Static resources
    ├── basis/          # Texture compression
    └── draco/          # 3D mesh compression
