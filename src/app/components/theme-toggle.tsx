'use client'

import { Moon, Palette, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export default function ThemeToggle() {
  const { mode, theme, toggleMode, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-themebg-secondary  transition-colors group"
        aria-label={`Switch to ${theme} theme`}
        title={`Current: ${theme} theme`}
      >
        <Palette className="group-hover:text-themetext" />
      </button>
      <button
        onClick={toggleMode}
        className="p-2 rounded-full hover:bg-themebg-secondary transition-colors group"
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'dark'
          ? (
              <Sun className="group-hover:text-themetext" />
            )
          : (
              <Moon className="group-hover:text-themetext" />
            )}
      </button>
    </div>
  )
}
