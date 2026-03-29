import { createContext, useContext } from 'react'

export const AppContext = createContext({ openEditForm: () => {} })
export const useApp = () => useContext(AppContext)
