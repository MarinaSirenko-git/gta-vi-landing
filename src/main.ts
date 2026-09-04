import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { createApp } from 'vue'

import App from './App.vue'
import './main.css'

gsap.registerPlugin(ScrollTrigger)

const refreshScrollTriggers = () => {
  ScrollTrigger.refresh()
}

window.addEventListener('load', refreshScrollTriggers, { once: true })
void document.fonts?.ready?.then(refreshScrollTriggers)

createApp(App).mount('#app')
