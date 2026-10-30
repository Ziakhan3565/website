import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Clean up any legacy Service Workers or offline caches to guarantee latest build
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().catch(() => {});
    }
  }).catch(() => {});
}

if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    for (const key of keys) {
      caches.delete(key).catch(() => {});
    }
  }).catch(() => {});
}

try {
  localStorage.removeItem('learn_and_grow_stories');
  localStorage.removeItem('learn_and_grow_stories_v1');
  localStorage.removeItem('stories');
  localStorage.removeItem('stories_list');
} catch (e) {
  // Ignore
}

