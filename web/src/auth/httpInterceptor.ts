import { refreshTokens } from '../api'

// Store for tracking if we're currently refreshing tokens to avoid multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// Enhanced fetch function that handles token refresh automatically
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Get current token
  const token = localStorage.getItem('accessToken')
  
  // Add authorization header if token exists
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }

  // Make the initial request
  let response = await fetch(url, {
    ...options,
    headers
  })

  // If request failed with 401 (Unauthorized), try to refresh token
  if (response.status === 401 && token) {
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => {
        // Retry the request with new token
        const newToken = localStorage.getItem('accessToken')
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...(newToken ? { 'Authorization': `Bearer ${newToken}` } : {})
          }
        })
      })
    }

    isRefreshing = true

    try {
      const refreshSuccess = await refreshTokens()
      if (refreshSuccess) {
        const newToken = localStorage.getItem('accessToken')
        processQueue(null, newToken)
        
        // Retry the original request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...(newToken ? { 'Authorization': `Bearer ${newToken}` } : {})
          }
        })
      } else {
        processQueue(new Error('Token refresh failed'), null)
        // Redirect to login or handle authentication failure
        window.location.reload() // This will show the login form
      }
    } catch (error) {
      processQueue(error, null)
      throw error
    } finally {
      isRefreshing = false
    }
  }

  return response
}

// You can export this to replace fetch calls in your API functions
export default authenticatedFetch
