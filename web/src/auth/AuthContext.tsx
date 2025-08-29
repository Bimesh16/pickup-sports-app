import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { refreshTokens } from '../api'

interface User {
  username: string
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (token) {
        // Try to decode the token to get username (basic validation)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const now = Date.now() / 1000
          
          if (payload.exp > now) {
            // Token is still valid
            setUser({ username: payload.sub })
          } else if (refreshToken) {
            // Token expired, try to refresh
            const refreshed = await refreshTokens()
            if (refreshed) {
              const newToken = localStorage.getItem('accessToken')
              if (newToken) {
                const newPayload = JSON.parse(atob(newToken.split('.')[1]))
                setUser({ username: newPayload.sub })
              }
            }
          }
        } catch (error) {
          console.error('Token validation failed:', error)
          // Clear invalid tokens
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('refreshNonce')
        }
      }
      
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('refreshNonce', data.nonce)
      
      // Set user
      setUser({ username })
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('refreshNonce')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
