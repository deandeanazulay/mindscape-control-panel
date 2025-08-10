import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/hud-fixes.css'
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) { registerSW({ immediate: true }); }
createRoot(document.getElementById("root")!).render(<App />);
