import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/surfaces/profile-suggest.css';
import './dev.css';
import { DevApp } from './DevApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DevApp />
  </StrictMode>,
);
