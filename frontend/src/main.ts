import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: 'none' // Unstyled mode to rely solely on our Tailwind classes
})

app.mount('#app')

// Hack to remove the PrimeUI watermark without needing a license key
const observer = new MutationObserver(() => {
    document.querySelectorAll('a').forEach(el => {
        if (el.textContent && el.textContent.includes('Invalid PrimeUI')) {
            // Find the closest fixed container to remove the whole banner
            let parent = el.parentElement;
            while (parent && parent !== document.body) {
                const style = window.getComputedStyle(parent);
                if (style.position === 'fixed' || style.position === 'absolute' || parent.style.zIndex === '99999') {
                    parent.remove();
                    return;
                }
                parent = parent.parentElement;
            }
            // Fallback: just remove the link
            el.remove();
        }
    });
});
observer.observe(document.body, { childList: true, subtree: true });
