import React, { FC, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import OutputTerminal from '../layout/OutputTerminal';
import { ArrowRight } from 'lucide-react';
import ClearCacheButton from '../common/ClearCacheButton';

interface PingSettings {
  target: string;
  count: number;
}

const DEFAULT_SETTINGS: PingSettings = {
  target: '',
  count: 4
};

export const PingTool: FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, connected } = useWebSocket();
  const [settings, setSettings] = useLocalStorage<PingSettings>('ping-settings', DEFAULT_SETTINGS);
  
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
    const values = {
      target: formData.get('target') as string,
      count: Number(formData.get('count'))
    };

    if (values.count < 1) values.count = 1;
    if (values.count > 30) values.count = 30;

    setSettings(values);

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

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      let newValue = value;
      if (value < 1) newValue = 1;
      if (value > 30) newValue = 30;
      setSettings(prev => ({ ...prev, count: newValue }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-100">Ping Tool Settings</h2>
        <ClearCacheButton onClear={handleClearCache} />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Target (IP/FQDN)
            </label>
            <input
              name="target"
              type="text"
              value={settings.target}
              onChange={(e) => setSettings(prev => ({ ...prev, target: e.target.value }))}
              placeholder="example.com or 192.168.1.1"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-100 placeholder-gray-500 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Count
            </label>
            <div className="flex items-center space-x-2">
              <input
                name="count"
                type="number"
                min={1}
                max={30}
                value={settings.count}
                onChange={handleCountChange}
                onBlur={() => {
                  if (settings.count < 1) setSettings(prev => ({ ...prev, count: 1 }));
                  if (settings.count > 30) setSettings(prev => ({ ...prev, count: 30 }));
                }}
                className="w-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                         text-gray-100 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-400">
                (1-30 packets)
              </span>
            </div>
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
        command={`$ ping -c ${settings.count} ${settings.target}`}
        output={output}
        error={error ?? undefined}
        onClear={handleClear}
        onCopy={handleCopy}
      />
    </div>
  );
};

export default PingTool;