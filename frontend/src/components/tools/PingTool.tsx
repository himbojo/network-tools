// File: frontend/src/components/tools/PingTool.tsx
import { FC, useState } from 'react'
import { z } from 'zod'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import OutputTerminal from '../layout/OutputTerminal'
import ToolInput from '../common/ToolInput'

// Validation schema for ping parameters
const pingSchema = z.object({
  target: z.string().min(1).max(255),
  count: z.number().min(1).max(30)
})

export const PingTool: FC = () => {
  const [output, setOutput] = useState<string[]>([])
  const { sendMessage, connected } = useWebSocket()
  const [lastUsed, setLastUsed] = useLocalStorage('ping-settings', {
    target: '',
    count: 4
  })

  const handleSubmit = async (values: z.infer<typeof pingSchema>) => {
    // TODO: Implement ping command execution
    // TODO: Handle WebSocket connection
    // TODO: Update output state with streaming results
  }

  const handleClear = () => {
    setOutput([])
  }

  const handleCopy = () => {
    // TODO: Implement copy functionality
  }

  return (
    <div className="space-y-4">
      <form className="space-y-4">
        <ToolInput
          label="Target (IP/FQDN)"
          name="target"
          type="text"
          defaultValue={lastUsed.target}
          // TODO: Add validation and error handling
        />
        <ToolInput
          label="Count"
          name="count"
          type="number"
          min={1}
          max={30}
          defaultValue={lastUsed.count}
          // TODO: Add validation and error handling
        />
        <button
          type="submit"
          disabled={!connected}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Run Ping
        </button>
      </form>

      <OutputTerminal
        command={`$ ping -c ${lastUsed.count} ${lastUsed.target}`}
        output={output}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  )
}