// File: frontend/src/App.tsx
import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import ThemeToggle from './components/layout/ThemeToggle'
import OutputTerminal from './components/layout/OutputTerminal'
import { PingTool } from './components/tools/PingTool'
import { DigTool } from './components/tools/DigTool'

const App = () => {
  const [selectedTool, setSelectedTool] = useState<'ping' | 'dig'>('ping')
  
  return (
    <div className="min-h-screen">
      {/* TODO: Implement dark/light mode wrapper */}
      <div className="flex">
        <Sidebar selectedTool={selectedTool} onToolSelect={setSelectedTool} />
        <main className="flex-1 p-6">
          {/* TODO: Implement tool switching logic */}
        </main>
      </div>
    </div>
  )
}

export default App