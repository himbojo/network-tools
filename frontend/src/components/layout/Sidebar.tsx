// File: frontend/src/components/layout/Sidebar.tsx
import { FC } from 'react'

interface SidebarProps {
  selectedTool: 'ping' | 'dig'
  onToolSelect: (tool: 'ping' | 'dig') => void
}

const Sidebar: FC<SidebarProps> = ({ selectedTool, onToolSelect }) => {
  return (
    <aside className="w-64 bg-gray-800 min-h-screen p-4">
      {/* TODO: Implement tool navigation */}
    </aside>
  )
}

export default Sidebar