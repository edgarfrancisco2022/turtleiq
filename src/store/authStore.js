import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uid = () => crypto.randomUUID()

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,   // { id, email, name } — currently signed-in user
      users: [],    // [{ id, email, name, password }] — registered users (demo only)

      signUp(email, name, password) {
        const users = get().users
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { error: 'An account with this email already exists.' }
        }
        const newUser = { id: uid(), email: email.trim(), name: name.trim(), password }
        const session = { id: newUser.id, email: newUser.email, name: newUser.name }
        set({ users: [...users, newUser], user: session })
        return { success: true }
      },

      signIn(email, password) {
        const user = get().users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        if (!user) return { error: 'Invalid email or password.' }
        set({ user: { id: user.id, email: user.email, name: user.name } })
        return { success: true }
      },

      signOut() {
        set({ user: null })
      },
    }),
    { name: 'turtleiq-auth' }
  )
)
