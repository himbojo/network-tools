import React from 'react';
import { Trash2 } from 'lucide-react';

interface ClearCacheButtonProps {
  onClear: () => void;
  className?: string;
}

export const ClearCacheButton: React.FC<ClearCacheButtonProps> = ({ onClear, className = '' }) => {
  return (
    <button
      onClick={onClear}
      type="button"
      className={`inline-flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 
                text-white font-medium rounded-lg transition-colors ${className}`}
      title="Reset all settings to default values"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Clear Settings
    </button>
  );
};

export default ClearCacheButton;