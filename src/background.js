import ExtPay from 'extpay'

import { EXTENSIONPAY_ID, EXTENSIONPAY_PLAN_IDS, paymentsConfigured } from './payment/config'

// Tab Registry ────────────────────────────────────────────────

let extPayStarted = false

function getExtPay() {
  if (!paymentsConfigured()) return null
  return ExtPay(EXTENSIONPAY_ID)
}

function ensureExtPayBackgroundStarted() {
  const extPay = getExtPay()
  if (!extPay || extPayStarted) return extPay
  extPay.startBackground()
  extPayStarted = true
  return extPay
}

function getPlanNickname(plan = 'monthly') {
  return EXTENSIONPAY_PLAN_IDS[plan] || plan
}

async function getRegistry() {
  const { tabRegistry = {} } = await chrome.storage.local.get('tabRegistry')
  return tabRegistry
}

async function saveRegistry(registry) {
  await chrome.storage.local.set({ tabRegistry: registry })
}

function extractSuspendedInfo(tabUrl = '') {
  try {
    const suspendedPrefix = chrome.runtime.getURL('suspended.html')
    if (!tabUrl || !tabUrl.startsWith(suspendedPrefix)) return null
    const parsed = new URL(tabUrl)
    const originalUrl = parsed.searchParams.get('url') || ''
    const originalTitle = parsed.searchParams.get('title') || ''
    if (!originalUrl) return null
    return { originalUrl, originalTitle }
  } catch {
    return null
  }
}

function detectCluster(url = '', title = '') {
  const u = (url || '').toLowerCase()
  const t = (title || '').toLowerCase()
  if (/github|notion|linear|jira|figma|slack|docs\.google/.test(u)) return 'Work'
  if (/amazon|ebay|etsy|shop|store|cart/.test(u)) return 'Shopping'
  if (/youtube|netflix|spotify|twitch|twitter|x\.com/.test(u)) return 'Entertainment'
  if (/youtube|netflix|spotify|twitch|watch|stream/.test(t)) return 'Entertainment'
  if (/stackoverflow|wikipedia|arxiv|reddit|medium|news|dev\.to/.test(u)) return 'Research'
  return 'Research'
}

function estimateRam(tab) {
  const u = (tab.url || '').toLowerCase()
  let base = 90

  if (/youtube|netflix|twitch|spotify/.test(u)) base = 420
  else if (/figma|canva|miro|docs\.google/.test(u)) base = 240
  else if (/amazon|ebay|etsy|shop/.test(u)) base = 200
  else if (/github|notion|linear|jira/.test(u)) base = 170
  else if (/stackoverflow|wikipedia|arxiv|reddit|medium/.test(u)) base = 120

  if (tab.active) base += 40
  if (tab.audible) base += 120
  if (tab.pinned) base = Math.max(70, base - 20)
  if (tab.discarded) base = Math.max(35, Math.round(base * 0.3))

  return Math.min(650, Math.max(35, Math.round(base)))
}

async function upsertTabMeta(tab, registryOverride) {
  const registry = registryOverride || await getRegistry()
  const existing = registry[tab.id] || {}
  const extracted = extractSuspendedInfo(tab.url || existing.url || '')
  const isSuspended = existing.suspended || !!extracted
  const suspendedUrl = existing.suspendedUrl || extracted?.originalUrl || null
  const suspendedTitle = existing.suspendedTitle || extracted?.originalTitle || ''
  const effectiveUrl = isSuspended
    ? (suspendedUrl || existing.url || tab.url)
    : (tab.url || existing.url)
  const effectiveTitle = isSuspended
    ? (suspendedTitle || tab.title || '')
    : (tab.title || '')

  registry[tab.id] = {
    createdAt: existing.createdAt || Date.now(),
    lastVisited: existing.lastVisited || Date.now(),
    cluster: existing.cluster || detectCluster(effectiveUrl, effectiveTitle),
    openerTabId: tab.openerTabId ?? existing.openerTabId ?? null,
    suspended: isSuspended,
    suspendedUrl,
    suspendedTitle,
    ram: estimateRam(tab),
    url: effectiveUrl,
    visitCount: existing.visitCount || 0,
  }

  if (!registryOverride) {
    await saveRegistry(registry)
  }

  return registry
}

async function syncOpenTabsToRegistry() {
  const [tabs, registry] = await Promise.all([
    chrome.tabs.query({}),
    getRegistry(),
  ])

  for (const tab of tabs) {
    await upsertTabMeta(tab, registry)
  }

  await saveRegistry(registry)
}

// Tab event listeners ────────────────────────────────────────────

chrome.tabs.onCreated.addListener(async tab => {
  const registry = await getRegistry()
  await upsertTabMeta(tab, registry)
  await saveRegistry(registry)
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab) return
  const registry = await getRegistry()
  const existing = registry[tabId] || {}
  const extracted = extractSuspendedInfo(tab.url || existing.url || '')
  const isSuspended = existing.suspended || !!extracted
  const suspendedUrl = existing.suspendedUrl || extracted?.originalUrl || null
  const suspendedTitle = existing.suspendedTitle || extracted?.originalTitle || ''
  const effectiveUrl = isSuspended
    ? (suspendedUrl || existing.url || tab.url)
    : (tab.url || existing.url)
  const effectiveTitle = isSuspended
    ? (suspendedTitle || tab.title || '')
    : (tab.title || '')

  registry[tabId] = {
    createdAt: existing.createdAt || Date.now(),
    lastVisited: existing.lastVisited || Date.now(),
    cluster: existing.cluster || detectCluster(effectiveUrl, effectiveTitle),
    openerTabId: tab.openerTabId ?? existing.openerTabId ?? null,
    suspended: isSuspended,
    suspendedUrl,
    suspendedTitle,
    ram: estimateRam(tab),
    url: effectiveUrl,
    visitCount: existing.visitCount || 0,
  }

  if (changeInfo.url) {
    registry[tabId].cluster = detectCluster(effectiveUrl, effectiveTitle)
  }

  await saveRegistry(registry)
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const registry = await getRegistry()
  if (registry[tabId]) {
    const existing = registry[tabId]
    existing.lastVisited = Date.now()
    existing.visitCount = (existing.visitCount || 0) + 1
    try {
      const tab = await chrome.tabs.get(tabId)
      const extracted = extractSuspendedInfo(tab.url || '')
      const isSuspended = existing.suspended || !!extracted
      const suspendedUrl = existing.suspendedUrl || extracted?.originalUrl || null
      const suspendedTitle = existing.suspendedTitle || extracted?.originalTitle || ''
      const effectiveUrl = isSuspended
        ? (suspendedUrl || existing.url || tab.url)
        : (tab.url || existing.url)
      const effectiveTitle = isSuspended
        ? (suspendedTitle || tab.title || '')
        : (tab.title || '')

      existing.suspended = isSuspended
      existing.suspendedUrl = suspendedUrl
      existing.suspendedTitle = suspendedTitle
      existing.ram = estimateRam(tab)
      existing.url = effectiveUrl
      existing.cluster = detectCluster(effectiveUrl, effectiveTitle)
    } catch {}
  }
  await saveRegistry(registry)
})

chrome.tabs.onRemoved.addListener(async tabId => {
  const registry = await getRegistry()
  const meta = registry[tabId]

  // If a sleeping tab was closed, save it to recentlyClosed so the user can reopen it
  if (meta && meta.suspended && meta.suspendedUrl) {
    const { recentlyClosed = [] } = await chrome.storage.local.get('recentlyClosed')
    recentlyClosed.unshift({
      id: `rc_${Date.now()}`,
      url: meta.suspendedUrl,
      title: meta.suspendedTitle || meta.suspendedUrl,
      domain: (() => { try { return new URL(meta.suspendedUrl).hostname } catch { return meta.suspendedUrl } })(),
      closedAt: Date.now(),
    })
    // Keep only the 10 most recent
    await chrome.storage.local.set({ recentlyClosed: recentlyClosed.slice(0, 10) })
  }

  delete registry[tabId]
  await saveRegistry(registry)
})

// Tab Suspension ───────────────────────────────────────────────

async function suspendTab(tabId) {
  const target = await chrome.tabs.get(tabId)
  const registry = await getRegistry()
  const existing = registry[tabId] || {}

  registry[tabId] = {
    createdAt: existing.createdAt || Date.now(),
    lastVisited: existing.lastVisited || Date.now(),
    cluster: existing.cluster || detectCluster(target.url || '', target.title || ''),
    openerTabId: target.openerTabId ?? existing.openerTabId ?? null,
    suspended: true,
    suspendedUrl: target.url,
    suspendedTitle: target.title,
    ram: estimateRam(target),
    url: target.url || existing.url,
    visitCount: existing.visitCount || 0,
  }
  await saveRegistry(registry)

  const suspendUrl = chrome.runtime.getURL('suspended.html') + `?title=${encodeURIComponent(target.title)}&url=${encodeURIComponent(target.url)}`
  await chrome.tabs.update(tabId, { url: suspendUrl })
}

async function restoreTab(tabId) {
  const registry = await getRegistry()
  const meta = registry[tabId]
  let restoreUrl = meta?.suspendedUrl

  if (!restoreUrl) {
    try {
      const current = await chrome.tabs.get(tabId)
      const extracted = extractSuspendedInfo(current.url || '')
      restoreUrl = extracted?.originalUrl || null
    } catch {}
  }

  if (!restoreUrl) return

  const existing = registry[tabId] || {}
  registry[tabId] = {
    ...existing,
    suspended: false,
    url: restoreUrl,
  }
  delete registry[tabId].suspendedUrl
  delete registry[tabId].suspendedTitle
  await saveRegistry(registry)

  await chrome.tabs.update(tabId, { url: restoreUrl })
}

// Message handler ──────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SUSPEND_TAB') {
    suspendTab(msg.tabId).then(() => sendResponse({ ok: true }))
  } else if (msg.type === 'RESTORE_TAB') {
    restoreTab(msg.tabId).then(() => sendResponse({ ok: true }))
  } else if (msg.type === 'OPEN_PAYMENT') {
    ;(async () => {
      const extPay = getExtPay()
      if (!extPay) {
        sendResponse({ ok: false, error: 'Payments are not configured yet.' })
        return
      }

      try {
        await extPay.openPaymentPage(getPlanNickname(msg.plan || 'monthly'))
        sendResponse({ ok: true })
      } catch (error) {
        sendResponse({ ok: false, error: error?.message || 'Unable to open payment page.' })
      }
    })()
  } else if (msg.type === 'OPEN_LOGIN') {
    ;(async () => {
      const extPay = getExtPay()
      if (!extPay) {
        sendResponse({ ok: false, error: 'Payments are not configured yet.' })
        return
      }

      try {
        await extPay.openLoginPage()
        sendResponse({ ok: true })
      } catch (error) {
        sendResponse({ ok: false, error: error?.message || 'Unable to open restore access page.' })
      }
    })()
  } else if (msg.type === 'REFRESH_PAYMENT_STATUS') {
    checkPaymentStatus()
      .then(tier => sendResponse({ ok: true, tier }))
      .catch(error => sendResponse({ ok: false, error: error?.message || 'Unable to refresh payment status.' }))
  } else if (msg.type === 'OPEN_BILLING') {
    ;(async () => {
      const extPay = getExtPay()
      if (!extPay) {
        sendResponse({ ok: false, error: 'Payments are not configured yet.' })
        return
      }

      try {
        await extPay.openPaymentPage()
        sendResponse({ ok: true })
      } catch (error) {
        sendResponse({ ok: false, error: error?.message || 'Unable to open billing page.' })
      }
    })()
  }
  return true // keep channel open for async
})

// Weekly Report Alarm ──────────────────────────────────────────

chrome.alarms.create('weeklyReport', {
  when: nextSunday2359(),
  periodInMinutes: 60 * 24 * 7,
})

function nextSunday2359() {
  const now = new Date()
  const day = now.getDay()
  const daysUntilSunday = (7 - day) % 7 || 7
  const sunday = new Date(now)
  sunday.setDate(now.getDate() + daysUntilSunday)
  sunday.setHours(23, 59, 0, 0)
  return sunday.getTime()
}

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'weeklyReport') return
  const registry = await getRegistry()
  const entries = Object.values(registry)
  const weekAgo = Date.now() - 7 * 86400000

  const opened = entries.filter(e => e.createdAt > weekAgo).length
  const revisited = entries.filter(e => (e.visitCount || 0) > 1 && e.createdAt > weekAgo).length
  const suspendedCount = entries.filter(e => e.suspended).length
  const avgAge = entries.length
    ? Math.round(entries.reduce((a, e) => a + (Date.now() - e.createdAt) / 86400000, 0) / entries.length * 10) / 10
    : 0

  const domainCounts = {}
  entries.forEach(e => {
    if (!e.url) return
    try {
      const domain = new URL(e.url).hostname
      domainCounts[domain] = (domainCounts[domain] || 0) + (e.visitCount || 1)
    } catch {}
  })
  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([domain, visits]) => ({ domain, visits }))

  await chrome.storage.local.set({
    weeklyReport: {
      opened,
      revisited,
      suspendedCount,
      avgAge,
      topDomains,
      ramSaved: `${(suspendedCount * 180 / 1024).toFixed(1)} GB`,
      summary: `You opened ${opened} tabs and revisited ${revisited} of them. ${suspendedCount} tabs freed RAM this week.`,
      generatedAt: Date.now(),
    }
  })
})

// Payment Status (ExtensionPay integration) ─────────────────────

async function checkPaymentStatus() {
  if (!paymentsConfigured()) {
    await chrome.storage.local.set({
      userTier: 'free',
      paymentConfigured: false,
      paymentPlan: null,
      paymentEmail: null,
    })
    return 'free'
  }

  try {
    const extPay = getExtPay()
    const user = await extPay.getUser()
    const tier = user.paid ? 'pro' : 'free'

    await chrome.storage.local.set({
      userTier: tier,
      paymentConfigured: true,
      paymentPlan: user.plan?.nickname || null,
      paymentEmail: user.email || null,
    })

    return tier
  } catch {
    return 'free'
  }
}

ensureExtPayBackgroundStarted()
checkPaymentStatus()
syncOpenTabsToRegistry()
