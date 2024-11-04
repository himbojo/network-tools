// File: frontend/src/components/tools/PingTool.tsx
import { FC, useState, useCallback } from 'react';
import { z } from 'zod';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import OutputTerminal from '../layout/OutputTerminal';
import ToolInput from '../common/ToolInput';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowRight } from 'lucide-react';

const pingSchema = z.object({
  target: z.string()
    .min(1, 'Target is required')
    .max(255, 'Target is too long')
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
      'Invalid IP address or domain name'
    ),
  count: z.number()
    .int('Must be a whole number')
    .min(1, 'Minimum count is 1')
    .max(30, 'Maximum count is 30')
});

export const PingTool: FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, connected } = useWebSocket();
  const [lastUsed, setLastUsed] = useLocalStorage('ping-settings', {
    target: '',
    count: 4
  });
  const [validation, setValidation] = useState<{
    target?: string;
    count?: string;
  }>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setValidation({});

    const formData = new FormData(event.currentTarget);
    const values = {
      target: formData.get('target') as string,
      count: Number(formData.get('count'))
    };

    try {
      const validated = pingSchema.parse(values);
      setLastUsed(validated);

      sendMessage(
        {
          type: 'ping',
          command: 'ping',
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
          label="Target (IP/FQDN)"
          name="target"
          type="text"
          defaultValue={lastUsed.target}
          error={validation.target}
          placeholder="example.com or 192.168.1.1"
          className="font-mono"
        />
        
        <ToolInput
          label="Count"
          name="count"
          type="number"
          min={1}
          max={30}
          defaultValue={lastUsed.count}
          error={validation.count}
          className="font-mono"
        />

        <button
          type="submit"
          disabled={!connected}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                   disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
        >
          Run Ping
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </form>

      <OutputTerminal
        command={`$ ping -c ${lastUsed.count} ${lastUsed.target}`}
        output={output}
        error={error ?? undefined}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default PingTool;