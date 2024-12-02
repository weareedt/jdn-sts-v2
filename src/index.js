import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import ExperienceWrapper from './Experience/ExperienceWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ExperienceWrapper />
    <h1 className="title">Organic</h1>
    <div className="credits">
      Made with ❤️ by <a href="https://github.com/hafizazhar" target="_blank" rel="noopener noreferrer">Hafiz Azhar</a>
    </div>
  </React.StrictMode>
);
