export const EXTENSIONPAY_ID = import.meta.env.VITE_EXTENSIONPAY_ID || ''

export const EXTENSIONPAY_PLAN_IDS = {
  monthly: import.meta.env.VITE_EXTENSIONPAY_PLAN_MONTHLY || 'monthly',
  yearly: import.meta.env.VITE_EXTENSIONPAY_PLAN_YEARLY || 'yearly',
}

export function paymentsConfigured() {
  return Boolean(EXTENSIONPAY_ID && EXTENSIONPAY_ID !== 'YOUR_EXTENSIONPAY_EXTENSION_ID')
}
