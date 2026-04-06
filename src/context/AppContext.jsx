import { createContext, useContext } from 'react'

export const AppContext = createContext({ openEditForm: () => {}, collapsed: false })
export const useApp = () => useContext(AppContext)
