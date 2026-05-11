import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  apiKey: null,
  isAdmin: false,

  loginAsAdmin: (password) => {
    if (password === 'admin123') {
      set({ isAdmin: true, user: { email: 'admin@villageapi.com', role: 'admin' } })
      return true
    }
    return false
  },

  loginAsUser: (userData, apiKey) => {
    set({ user: userData, apiKey, isAdmin: false })
  },

  logout: () => set({ user: null, apiKey: null, isAdmin: false })
}))

export default useAuthStore