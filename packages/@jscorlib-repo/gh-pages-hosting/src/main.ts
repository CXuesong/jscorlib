import { mount } from 'svelte'
import App from './App.svelte'
import './main.scss'

const app = mount(App, {
  target: document.querySelector('.app-root')!,
});

export default app
