import './styles/index.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persistedState from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './providers/router'
import { registerServices } from './providers/services'
import { installUi } from './providers/ui'

const app = createApp(App)
const pinia = createPinia()

pinia.use(persistedState)
registerServices()
installUi(app)

app.use(pinia)
app.use(router)
app.mount('#app')
