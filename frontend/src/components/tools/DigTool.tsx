import { FC, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import OutputTerminal from '../layout/OutputTerminal';
import { ArrowRight } from 'lucide-react';
import ClearCacheButton from '../common/ClearCacheButton';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'PTR'] as const;
type RecordType = typeof RECORD_TYPES[number];

interface DigSettings {
  domain: string;
  recordType: RecordType;
  nameserver: string;
  parameters: {
    short: boolean;
  };
}

const DEFAULT_SETTINGS: DigSettings = {
  domain: '',
  recordType: 'A',
  nameserver: '',
  parameters: {
    short: false
  }
};

const Switch: FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <label className="relative flex items-start cursor-pointer">
    <div className="flex items-center h-6">
      <div
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
          ${checked ? 'bg-blue-600' : 'bg-gray-700'}
        `}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`
            absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
    </div>
    <div className="ml-3">
      <span className="text-sm font-medium text-gray-200">{label}</span>
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
    </div>
  </label>
);

export const DigTool: FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, connected } = useWebSocket();
  const [settings, setSettings] = useLocalStorage<DigSettings>('dig-settings', DEFAULT_SETTINGS);
  
  const formRef = useRef<HTMLFormElement>(null);

  const handleClearCache = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setOutput([]);
    setError(null);
  }, [setSettings]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    const newSettings: DigSettings = {
      domain: formData.get('domain') as string,
      recordType: formData.get('recordType') as RecordType,
      nameserver: formData.get('nameserver') as string,
      parameters: settings.parameters
    };

    setSettings(newSettings);

    sendMessage(
      {
        type: 'dig',
        command: 'dig',
        parameters: newSettings
      },
      (output) => {
        setOutput(prev => [...prev, output]);
      },
      (error) => {
        setError(error);
      }
    );
  };

  const handleParameterChange = (key: keyof DigSettings['parameters']) => (value: boolean) => {
    setSettings(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-100">Dig Tool Settings</h2>
        <ClearCacheButton onClear={handleClearCache} />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Domain
            </label>
            <input
              name="domain"
              type="text"
              value={settings.domain}
              onChange={(e) => setSettings(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="example.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-100 placeholder-gray-500 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Record Type
            </label>
            <select
              name="recordType"
              value={settings.recordType}
              onChange={(e) => setSettings(prev => ({ ...prev, recordType: e.target.value as RecordType }))}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-100 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
            >
              {RECORD_TYPES.map(type => (
                <option key={type} value={type}>{type} Record</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Nameserver (Optional)
            </label>
            <input
              name="nameserver"
              type="text"
              value={settings.nameserver}
              onChange={(e) => setSettings(prev => ({ ...prev, nameserver: e.target.value }))}
              placeholder="8.8.8.8 or dns.google"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-100 placeholder-gray-500 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-200 mb-4">Options</label>
          <div>
            <Switch
              checked={settings.parameters.short}
              onChange={handleParameterChange('short')}
              label="Short Output"
              description="Remove comments and additional information"
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
          Run Dig
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </form>

      <OutputTerminal
        command={`$ dig ${settings.nameserver ? `@${settings.nameserver} ` : ''}${settings.domain} ${settings.recordType}`}
        output={output}
        error={error ?? undefined}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default DigTool;