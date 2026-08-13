import './dev.css';
import { mount } from 'svelte';
import App from './App.svelte';

// Dark is the sole colour mode; consumers pin it statically and so does this.
document.documentElement.setAttribute('data-colour-mode', 'dark');

mount(App, { target: document.getElementById('app')! });
