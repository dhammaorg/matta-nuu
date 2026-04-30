const LAST_SESSION_ID_KEY = 'matta-nuu-last-session-id'
const LAST_SESSION_ROUTE_KEY = 'matta-nuu-last-session-route'

const SESSION_ROUTE_NAMES = [
  'session_overview',
  'session_schedule',
  'session_inventories',
  'session_stocks',
  'session_orders',
]

const SESSION_ROUTE_PARENT_NAMES = {
  session_order: 'session_orders',
  session_inventory: 'session_inventories',
}

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime())
}

function compareSessionsByRecency(a, b) {
  const aHasCreatedAt = isValidDate(a?.created_at)
  const bHasCreatedAt = isValidDate(b?.created_at)
  if (aHasCreatedAt && bHasCreatedAt) {
    const createdAtDiff = new Date(b.created_at) - new Date(a.created_at)
    if (createdAtDiff !== 0) return createdAtDiff
  }
  return Number(b?.id || 0) - Number(a?.id || 0)
}

export function normalizeSessionRouteName(routeName) {
  if (SESSION_ROUTE_NAMES.includes(routeName)) return routeName
  return SESSION_ROUTE_PARENT_NAMES[routeName] || null
}

export function writeLastSessionId(sessionId) {
  const id = typeof sessionId === 'number' ? sessionId : parseInt(sessionId, 10)
  if (!Number.isFinite(id)) return
  localStorage.setItem(LAST_SESSION_ID_KEY, String(id))
}

export function readLastSessionId() {
  const raw = localStorage.getItem(LAST_SESSION_ID_KEY)
  const id = raw ? parseInt(raw, 10) : NaN
  return Number.isFinite(id) ? id : null
}

export function writeLastSessionRoute(routeName) {
  const normalizedRouteName = normalizeSessionRouteName(routeName)
  if (!normalizedRouteName) return
  localStorage.setItem(LAST_SESSION_ROUTE_KEY, normalizedRouteName)
}

export function readLastSessionRouteName() {
  return normalizeSessionRouteName(localStorage.getItem(LAST_SESSION_ROUTE_KEY)) || 'session_overview'
}

export function writeSessionNavigation(sessionId, routeName) {
  writeLastSessionId(sessionId)
  writeLastSessionRoute(routeName)
}

export function resolveDefaultSessionId(sessionsObject = {}) {
  const sessions = Object.values(sessionsObject).filter((session) => !session?.is_template)
  const starredSessions = sessions
    .filter((session) => session?.starred === true)
    .sort(compareSessionsByRecency)
  if (starredSessions[0]?.id) return starredSessions[0].id

  const sortedSessions = sessions.slice().sort(compareSessionsByRecency)
  return sortedSessions[0]?.id ?? null
}
