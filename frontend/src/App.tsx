// File: frontend/src/App.tsx
import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import ThemeToggle from './components/layout/ThemeToggle';
import { PingTool } from './components/tools/PingTool';
import { DigTool } from './components/tools/DigTool';

const App = () => {
  const [selectedTool, setSelectedTool] = useState<'ping' | 'dig'>('ping');
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex">
        <Sidebar selectedTool={selectedTool} onToolSelect={setSelectedTool} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {selectedTool === 'ping' ? 'Ping Tool' : 'Dig Tool'}
              </h1>
              <ThemeToggle />
            </div>
            
            {selectedTool === 'ping' ? <PingTool /> : <DigTool />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;