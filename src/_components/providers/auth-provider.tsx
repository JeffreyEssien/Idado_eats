'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Models } from 'appwrite'
import { getUser } from '@/_lib/auth'

type AuthContextType = {
  user: Models.User<Models.Preferences> | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refresh: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const u = await getUser()
    setUser(u)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
