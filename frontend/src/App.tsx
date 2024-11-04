import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import ThemeToggle from './components/layout/ThemeToggle';
import { PingTool } from './components/tools/PingTool';
import { DigTool } from './components/tools/DigTool';

const App = () => {
  const [selectedTool, setSelectedTool] = useState<'ping' | 'dig'>('ping');
  
  return (
    <div className="min-h-screen bg-[#1a1b26]">
      <div className="flex h-screen">
        <Sidebar selectedTool={selectedTool} onToolSelect={setSelectedTool} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-100">
                  {selectedTool === 'ping' ? 'Ping Tool' : 'Dig Tool'}
                </h1>
                <ThemeToggle />
              </div>
              
              {selectedTool === 'ping' ? (
                <PingTool />
              ) : (
                <DigTool />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;