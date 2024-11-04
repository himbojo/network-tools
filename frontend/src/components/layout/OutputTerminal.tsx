// File: frontend/src/components/layout/OutputTerminal.tsx
import { FC, useRef, useEffect } from 'react';
import { ClipboardCopy, Trash2 } from 'lucide-react';

interface OutputTerminalProps {
  command?: string;
  output: string[];
  onClear: () => void;
  onCopy: () => void;
  error?: string;
}

const OutputTerminal: FC<OutputTerminalProps> = ({ 
  command, 
  output, 
  onClear, 
  onCopy,
  error 
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Terminal Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onCopy}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Copy output"
          >
            <ClipboardCopy className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onClear}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Clear output"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="p-4 font-mono text-sm text-gray-300 max-h-96 overflow-y-auto"
      >
        {command && (
          <div className="text-green-400 mb-2">
            {command}
          </div>
        )}
        {output.map((line, index) => (
          <div 
            key={index}
            className="whitespace-pre-wrap break-all"
            // Allow HTML for ANSI color codes
            dangerouslySetInnerHTML={{ 
              __html: line.replace(/\n/g, '<br/>') 
            }}
          />
        ))}
        {error && (
          <div className="text-red-400 mt-2">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputTerminal;