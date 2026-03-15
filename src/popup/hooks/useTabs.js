import { useState, useEffect } from 'react'

// Days since a timestamp
function daysSince(ts) {
  return Math.floor((Date.now() - ts) / 86400000)
}

// Infer cluster from URL + title
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

function fallbackFavicon(tab) {
  const u = (tab.url || '').toLowerCase()
  if (u.startsWith('chrome://settings')) return '⚙️'
  if (u.startsWith('chrome://extensions')) return '🧩'
  if (u.startsWith('chrome://')) return '🌐'
  if (u.startsWith('chrome-extension://')) return '🧩'
  return '🌐'
}

function extractSuspendedInfo(tabUrl = '') {
  try {
    if (!tabUrl || !tabUrl.includes('/suspended.html')) return null
    const parsed = new URL(tabUrl)
    const originalUrl = parsed.searchParams.get('url') || ''
    const originalTitle = parsed.searchParams.get('title') || ''
    if (!originalUrl) return null
    return { originalUrl, originalTitle }
  } catch {
    return null
  }
}

// Get favicon URL from tab
function faviconUrl(tab) {
  const url = tab.url || ''
  const isWebTab = /^https?:\/\//i.test(url)
  if (!isWebTab) {
    return fallbackFavicon(tab)
  }

  if (tab.favIconUrl && /^https?:\/\//i.test(tab.favIconUrl)) {
    return tab.favIconUrl
  }

  try {
    const hostname = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch {
    return fallbackFavicon(tab)
  }
}

export function useTabs() {
  const [tabs, setTabs] = useState([])

  async function loadTabs() {
    const [chromeTabs, { tabRegistry = {} }] = await Promise.all([
      chrome.tabs.query({}),
      chrome.storage.local.get('tabRegistry'),
    ])

    const enriched = chromeTabs.map(tab => {
      const meta = tabRegistry[tab.id] || {}
      const extracted = extractSuspendedInfo(tab.url || '')
      const isSuspended = meta.suspended || !!extracted
      const displayUrl = isSuspended
        ? (meta.suspendedUrl || extracted?.originalUrl || tab.url || '')
        : (tab.url || '')
      const displayTitle = isSuspended
        ? (meta.suspendedTitle || extracted?.originalTitle || tab.title || displayUrl)
        : (tab.title || displayUrl)
      let domain = 'unknown'
      try {
        domain = new URL(displayUrl || 'https://example.com').hostname
      } catch {
        domain = 'unknown'
      }

      return {
        id: tab.id,
        domain,
        title: displayTitle,
        favicon: faviconUrl({ ...tab, url: displayUrl }),
        age: daysSince(meta.createdAt || Date.now()),
        cluster: meta.cluster || detectCluster(displayUrl, displayTitle),
        ram: meta.ram || estimateRam(tab),
        visited: meta.lastVisited > (Date.now() - 86400000),
        suspended: isSuspended,
        url: displayUrl,
      }
    })

    setTabs(enriched)
  }

  useEffect(() => {
    loadTabs()
    // Re-load when tabs change
    chrome.tabs.onUpdated.addListener(loadTabs)
    chrome.tabs.onRemoved.addListener(loadTabs)
    chrome.tabs.onCreated.addListener(loadTabs)
    return () => {
      chrome.tabs.onUpdated.removeListener(loadTabs)
      chrome.tabs.onRemoved.removeListener(loadTabs)
      chrome.tabs.onCreated.removeListener(loadTabs)
    }
  }, [])

  return tabs
}
