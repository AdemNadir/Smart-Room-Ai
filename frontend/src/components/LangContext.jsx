import { createContext, useContext, useState, useEffect } from 'react'

const LangContext = createContext()

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState('en')

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => {
  const context = useContext(LangContext)
  if (!context) throw new Error('useLang must be used within a LangProvider')
  return context
}