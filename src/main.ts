import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { createApp } from 'vue'

import App from './App.vue'
import './main.css'

gsap.registerPlugin(ScrollTrigger)

createApp(App).mount('#app')
