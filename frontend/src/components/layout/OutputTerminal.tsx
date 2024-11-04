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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="rounded-lg overflow-hidden bg-[#1a1b26] border border-gray-800">
      {/* Terminal Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#1f2335] border-b border-gray-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
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