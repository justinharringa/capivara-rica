import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app')! });

export default app;

// Debug handle for automated play-throughs (no PII; the game has none).
import { game } from '$lib/game.svelte';
(window as unknown as { __game: unknown }).__game = game;
