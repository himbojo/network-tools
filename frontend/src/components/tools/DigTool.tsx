// File: frontend/src/components/tools/DigTool.tsx
import { FC, useState, useCallback } from 'react';
import { z } from 'zod';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import OutputTerminal from '../layout/OutputTerminal';
import ToolInput from '../common/ToolInput';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowRight } from 'lucide-react';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA'] as const;
type RecordType = typeof RECORD_TYPES[number];

interface DigSettings {
  domain: string;
  recordType: RecordType;
  parameters: {
    short: boolean;
    trace: boolean;
    stats: boolean;
  };
}

const digSchema = z.object({
  domain: z.string()
    .min(1, 'Domain is required')
    .max(255, 'Domain is too long')
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Invalid domain name'
    ),
  recordType: z.enum(RECORD_TYPES),
  parameters: z.object({
    short: z.boolean(),
    trace: z.boolean(),
    stats: z.boolean()
  })
});

export const DigTool: FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, connected } = useWebSocket();
  const [lastUsed, setLastUsed] = useLocalStorage<DigSettings>('dig-settings', {
    domain: '',
    recordType: 'A',
    parameters: {
      short: false,
      trace: false,
      stats: true
    }
  });
  const [validation, setValidation] = useState<{
    domain?: string;
    recordType?: string;
  }>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setValidation({});

    const formData = new FormData(event.currentTarget);
    const values = {
      domain: formData.get('domain') as string,
      recordType: formData.get('recordType') as RecordType,
      parameters: {
        short: formData.get('short') === 'on',
        trace: formData.get('trace') === 'on',
        stats: formData.get('stats') === 'on'
      }
    };

    try {
      const validated = digSchema.parse(values);
      setLastUsed(validated);

      sendMessage(
        {
          type: 'dig',
          command: 'dig',
          parameters: validated
        },
        (output) => {
          setOutput(prev => [...prev, output]);
        },
        (error) => {
          setError(error);
        }
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = {} as Record<string, string>;
        err.errors.forEach(error => {
          const path = error.path[0] as string;
          errors[path] = error.message;
        });
        setValidation(errors);
      }
    }
  };

  const handleClear = useCallback(() => {
    setOutput([]);
    setError(null);
  }, []);

  const handleCopy = useCallback(() => {
    const text = output.join('\n');
    navigator.clipboard.writeText(text);
  }, [output]);

  return (
    <div className="space-y-4">
      {!connected && (
        <Alert variant="destructive">
          <AlertDescription>
            Not connected to server. Please wait or refresh the page.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <ToolInput
          label="Domain"
          name="domain"
          type="text"
          defaultValue={lastUsed.domain}
          error={validation.domain}
          placeholder="example.com"
          className="font-mono"
        />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium">Record Type</label>
          <select
            name="recordType"
            defaultValue={lastUsed.recordType}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 font-mono"
          >
            {RECORD_TYPES.map(type => (
              <option key={type} value={type}>{type} Record</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Options</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="short"
                defaultChecked={lastUsed.parameters.short}
                className="rounded border-gray-300"
              />
              <span>Short output (remove comments)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="trace"
                defaultChecked={lastUsed.parameters.trace}
                className="rounded border-gray-300"
              />
              <span>Trace query path</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="stats"
                defaultChecked={lastUsed.parameters.stats}
                className="rounded border-gray-300"
              />
              <span>Show statistics</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!connected}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                   disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
        >
          Run Dig
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </form>

      <OutputTerminal
        command={`$ dig ${lastUsed.domain} ${lastUsed.recordType}`}
        output={output}
        error={error ?? undefined}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default DigTool;