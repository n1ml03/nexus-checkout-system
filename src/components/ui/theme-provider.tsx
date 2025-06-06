"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const { theme, setTheme } = React.useContext(
    React.createContext<{ theme: string | undefined; setTheme: (theme: string) => void }>({
      theme: undefined,
      setTheme: () => {},
    })
  )
  
  return {
    theme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
    isSystem: theme === "system",
  }
}
