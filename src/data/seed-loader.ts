const CATALOG_KEY = 'ofb.catalog'
const POLLS_KEY = 'ofb.polls'
const INDEX_KEY = 'ofb.index'
const SAVED_KEY = 'ofb.saved'
const USER_KEY = 'ofb.user'

export async function ensureSeedsLoaded(): Promise<void> {
  const loaders = [] as Array<Promise<void>>

  if (!localStorage.getItem(CATALOG_KEY)) {
    loaders.push(fetch('/data/catalog2.json').then(r => r.json()).then(data => {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(data))
    }))
  }
  if (!localStorage.getItem(POLLS_KEY)) {
    loaders.push(fetch('/data/polls2.json').then(r => r.json()).then(data => {
      localStorage.setItem(POLLS_KEY, JSON.stringify(data))
    }))
  }
  if (!localStorage.getItem(INDEX_KEY)) {
    loaders.push(fetch('/data/index.json').then(r => r.json()).then(data => {
      localStorage.setItem(INDEX_KEY, JSON.stringify(data))
    }))
  }
  if (!localStorage.getItem(SAVED_KEY)) {
    loaders.push(fetch('/data/saved.json').then(r => r.json()).then(data => {
      localStorage.setItem(SAVED_KEY, JSON.stringify(data))
    }))
  }
  if (!localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 'user_local' }))
  }

  await Promise.all(loaders)
}

export function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function setLocal<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storageKeys = {
  CATALOG_KEY,
  POLLS_KEY,
  INDEX_KEY,
  SAVED_KEY,
  USER_KEY,
} 