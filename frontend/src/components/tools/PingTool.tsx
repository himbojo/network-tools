import { FC, useState, useCallback } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import OutputTerminal from '../layout/OutputTerminal';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowRight } from 'lucide-react';

export const PingTool: FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, connected } = useWebSocket();
  const [lastUsed, setLastUsed] = useLocalStorage('ping-settings', {
    target: '',
    count: 4
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    const values = {
      target: formData.get('target') as string,
      count: Number(formData.get('count'))
    };

    sendMessage(
      {
        type: 'ping',
        command: 'ping',
        parameters: values
      },
      (output) => {
        setOutput(prev => [...prev, output]);
      },
      (error) => {
        setError(error);
      }
    );
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
    <div className="space-y-6">
      {!connected && (
        <Alert variant="destructive" className="bg-red-900/30 border border-red-600">
          <AlertDescription className="text-red-400">
            Not connected to server. Please wait or refresh the page.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Target Input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Target (IP/FQDN)
            </label>
            <input
              name="target"
              type="text"
              defaultValue={lastUsed.target}
              placeholder="example.com or 192.168.1.1"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-100 placeholder-gray-500 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Count Input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Count
            </label>
            <input
              name="count"
              type="number"
              min={1}
              max={30}
              defaultValue={lastUsed.count}
              className="w-20 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-100 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!connected}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                   disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg
                   text-white font-medium transition-colors"
        >
          Run Ping
          <ArrowRight className="ml-2 h-4 w-4" />
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