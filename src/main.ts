import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app')! });

export default app;

// Debug handle for automated play-throughs, only in dev or when built with VITE_E2E=1.
if (import.meta.env.DEV || import.meta.env.VITE_E2E === '1') {
  const { game } = await import('$lib/game.svelte');
  (window as unknown as { __game: unknown }).__game = game;
}
