// File: frontend/src/components/tools/DigTool.tsx
import { FC, useState } from 'react'
import { z } from 'zod'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import OutputTerminal from '../layout/OutputTerminal'
import ToolInput from '../common/ToolInput'

// Validation schema for dig parameters
const digSchema = z.object({
  domain: z.string().min(1).max(255),
  recordType: z.enum(['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA']),
  parameters: z.object({
    // TODO: Add additional dig parameters as needed
  }).optional()
})

export const DigTool: FC = () => {
  const [output, setOutput] = useState<string[]>([])
  const { sendMessage, connected } = useWebSocket()
  const [lastUsed, setLastUsed] = useLocalStorage('dig-settings', {
    domain: '',
    recordType: 'A'
  })

  const handleSubmit = async (values: z.infer<typeof digSchema>) => {
    // TODO: Implement dig command execution
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
          label="Domain"
          name="domain"
          type="text"
          defaultValue={lastUsed.domain}
          // TODO: Add validation and error handling
        />
        <select
          name="recordType"
          defaultValue={lastUsed.recordType}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option value="A">A Record</option>
          <option value="AAAA">AAAA Record</option>
          <option value="MX">MX Record</option>
          <option value="NS">NS Record</option>
          <option value="TXT">TXT Record</option>
          <option value="CNAME">CNAME Record</option>
          <option value="SOA">SOA Record</option>
        </select>
        
        {/* TODO: Add additional parameter toggles */}
        
        <button
          type="submit"
          disabled={!connected}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Run Dig
        </button>
      </form>

      <OutputTerminal
        command={`$ dig ${lastUsed.domain} ${lastUsed.recordType}`}
        output={output}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  )
}