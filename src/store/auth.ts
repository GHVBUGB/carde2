import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/lib/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      // 操作
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      }),

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { 
              ...currentUser, 
              ...updates,
              updated_at: new Date().toISOString()
            } 
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)
