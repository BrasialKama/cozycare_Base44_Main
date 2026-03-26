export type UserIntent = 'parent' | 'nanny'

export interface DiscoveryPreferences {
  location: string
  date: string
}

const INTENT_KEY = 'cozycare-user-intent'
const DISCOVERY_KEY = 'cozycare-discovery-preferences'

export function setUserIntent(intent: UserIntent) {
  localStorage.setItem(INTENT_KEY, intent)
}

export function getUserIntent(): UserIntent | null {
  const value = localStorage.getItem(INTENT_KEY)
  return value === 'parent' || value === 'nanny' ? value : null
}

export function setDiscoveryPreferences(preferences: DiscoveryPreferences) {
  localStorage.setItem(DISCOVERY_KEY, JSON.stringify(preferences))
}

export function getDiscoveryPreferences(): DiscoveryPreferences | null {
  const raw = localStorage.getItem(DISCOVERY_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (parsed?.location && parsed?.date) return parsed
  } catch {
    return null
  }

  return null
}
