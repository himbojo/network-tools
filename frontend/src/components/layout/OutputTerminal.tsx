// File: frontend/src/components/layout/OutputTerminal.tsx
import { FC } from 'react'

interface OutputTerminalProps {
  command?: string
  output: string[]
  onClear: () => void
  onCopy: () => void
}

const OutputTerminal: FC<OutputTerminalProps> = ({ command, output, onClear, onCopy }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 mt-4">
      {/* TODO: Implement terminal-like output display */}
      {/* TODO: Add copy and clear buttons */}
    </div>
  )
}

export default OutputTerminal