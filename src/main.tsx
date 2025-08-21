import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for PWA functionality (deferred for better performance)
if ('serviceWorker' in navigator) {
  setTimeout(() => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }, 1000); // Delay registration by 1 second
}

createRoot(document.getElementById("root")!).render(<App />);
