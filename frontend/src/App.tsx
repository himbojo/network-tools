import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import ThemeToggle from './components/layout/ThemeToggle';
import { PingTool } from './components/tools/PingTool';
import { DigTool } from './components/tools/DigTool';

const App = () => {
  const [selectedTool, setSelectedTool] = useState<'ping' | 'dig'>('ping');
  
  return (
    // Remove conflicting styles, use Tailwind classes properly
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex h-screen">
        <Sidebar selectedTool={selectedTool} onToolSelect={setSelectedTool} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTool === 'ping' ? 'Ping Tool' : 'Dig Tool'}
                </h1>
                <ThemeToggle />
              </div>
              
              {selectedTool === 'ping' ? <PingTool /> : <DigTool />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;