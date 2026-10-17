import type { ToastMessageOptions } from 'primevue/toast'

export function notifyToast(message: ToastMessageOptions): void {
  window.dispatchEvent(new CustomEvent<ToastMessageOptions>('app:toast', { detail: message }))
}
