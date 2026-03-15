import { useState, useEffect } from 'react'

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    chrome.storage.local.get(key, result => {
      if (result[key] !== undefined) setValue(result[key])
    })
    const listener = (changes) => {
      if (changes[key]) setValue(changes[key].newValue)
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [key])

  function set(newValueOrUpdater) {
    setValue(prevValue => {
      const nextValue = typeof newValueOrUpdater === 'function'
        ? newValueOrUpdater(prevValue)
        : newValueOrUpdater

      chrome.storage.local.set({ [key]: nextValue })
      return nextValue
    })
  }

  return [value, set]
}
