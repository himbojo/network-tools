// File: frontend/src/components/layout/ThemeToggle.tsx
import { FC } from 'react'
import { useTheme } from '../../hooks/useTheme'

const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      {/* TODO: Implement theme toggle button */}
    </button>
  )
}

export default ThemeToggle