import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'

const AppTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{cyan.50}',
      100: '{cyan.100}',
      200: '{cyan.200}',
      300: '{cyan.300}',
      400: '{cyan.400}',
      500: '{cyan.500}',
      600: '{cyan.600}',
      700: '{cyan.700}',
      800: '{cyan.800}',
      900: '{cyan.900}',
      950: '{cyan.950}',
    },
  },
})

export function installUi(app: App): void {
  app.use(PrimeVue, {
    theme: {
      preset: AppTheme,
      options: { darkModeSelector: '.app-dark', cssLayer: false },
    },
  })
  app.use(ToastService)
}
