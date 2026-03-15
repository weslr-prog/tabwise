import { useState, useEffect } from 'react'

function sendRuntimeMessage(message) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message })
        return
      }

      resolve(response || { ok: false, error: 'No response received.' })
    })
  })
}

export function usePaywall() {
  const [tier, setTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [paymentConfigured, setPaymentConfigured] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(['userTier', 'paymentConfigured'], result => {
      setTier(result.userTier || 'free')
      setPaymentConfigured(!!result.paymentConfigured)
      setLoading(false)
    })

    const listener = changes => {
      if (changes.userTier) setTier(changes.userTier.newValue || 'free')
      if (changes.paymentConfigured) setPaymentConfigured(!!changes.paymentConfigured.newValue)
    }

    chrome.storage.onChanged.addListener(listener)
    sendRuntimeMessage({ type: 'REFRESH_PAYMENT_STATUS' }).finally(() => setLoading(false))

    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const isPro = tier === 'pro'

  async function triggerUpgrade(plan = 'monthly') {
    return sendRuntimeMessage({ type: 'OPEN_PAYMENT', plan })
  }

  async function restorePurchase() {
    return sendRuntimeMessage({ type: 'OPEN_LOGIN' })
  }

  async function manageBilling() {
    return sendRuntimeMessage({ type: 'OPEN_BILLING' })
  }

  async function refreshStatus() {
    return sendRuntimeMessage({ type: 'REFRESH_PAYMENT_STATUS' })
  }

  return { tier, isPro, loading, paymentConfigured, triggerUpgrade, restorePurchase, manageBilling, refreshStatus }
}
