const params = new URLSearchParams(window.location.search)
const title = params.get('title') || 'Sleeping Tab'
const url = params.get('url') || ''

const titleElement = document.getElementById('site-title')
const urlElement = document.getElementById('site-url')
const restoreButton = document.getElementById('restore-btn')

if (titleElement) titleElement.textContent = title
if (urlElement) urlElement.textContent = url

document.title = 'This tab is napping - leave open to restore'

if (restoreButton) {
  restoreButton.addEventListener('click', () => {
    if (url) window.location.href = url
  })
}
