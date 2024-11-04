import { FC, useState, useCallback, useMemo } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import OutputTerminal from '../layout/OutputTerminal';
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

// Define default settings as a constant
const DEFAULT_SETTINGS: DigSettings = {
  domain: '',
  recordType: 'A',
  parameters: {
    short: false,
    trace: false,
    stats: true
  }
};

export const DigTool: FC = () => {
  // Ensure we're using the default settings properly
  const [settings, setSettings] = useLocalStorage<DigSettings>('dig-settings', DEFAULT_SETTINGS);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, connected } = useWebSocket();

  // Memoize the current parameters to ensure they're always defined
  const currentParameters = useMemo(() => ({
    short: settings?.parameters?.short ?? DEFAULT_SETTINGS.parameters.short,
    trace: settings?.parameters?.trace ?? DEFAULT_SETTINGS.parameters.trace,
    stats: settings?.parameters?.stats ?? DEFAULT_SETTINGS.parameters.stats,
  }), [settings?.parameters]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const values: DigSettings = {
      domain: (formData.get('domain') as string) || '',
      recordType: (formData.get('recordType') as RecordType) || 'A',
      parameters: {
        short: formData.get('short') === 'on',
        trace: formData.get('trace') === 'on',
        stats: formData.get('stats') === 'on'
      }
    };

    setSettings(values);

    sendMessage(
      {
        type: 'dig',
        command: 'dig',
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Domain
          </label>
          <input
            name="domain"
            type="text"
            defaultValue={settings?.domain ?? ''}
            placeholder="example.com"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                     text-gray-100 placeholder-gray-500 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Record Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Record Type
          </label>
          <select
            name="recordType"
            defaultValue={settings?.recordType ?? 'A'}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                     text-gray-100 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent"
          >
            {RECORD_TYPES.map(type => (
              <option key={type} value={type}>{type} Record</option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-200">Options</label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="short"
                defaultChecked={currentParameters.short}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 
                         text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              <span className="text-gray-200">Short output (remove comments)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="trace"
                defaultChecked={currentParameters.trace}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 
                         text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              <span className="text-gray-200">Trace query path</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="stats"
                defaultChecked={currentParameters.stats}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 
                         text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              <span className="text-gray-200">Show statistics</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!connected}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                   disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg
                   text-white font-medium transition-colors"
        >
          Run Dig
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </form>

      <OutputTerminal
        command={`$ dig ${settings?.domain ?? ''} ${settings?.recordType ?? 'A'}`}
        output={output}
        error={error ?? undefined}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default DigTool;