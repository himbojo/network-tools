import { Monitor, Wifi } from 'lucide-react';

interface SidebarProps {
  selectedTool: 'ping' | 'dig';
  onToolSelect: (tool: 'ping' | 'dig') => void;
}

const Sidebar = ({ selectedTool, onToolSelect }: SidebarProps) => {
  const tools = [
    {
      id: 'ping',
      name: 'Ping Tool',
      icon: Wifi,
      description: 'Test connectivity to a host'
    },
    {
      id: 'dig',
      name: 'Dig Tool',
      icon: Monitor,
      description: 'Query DNS records'
    }
  ] as const;

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Network Tools</h1>
      </div>

      {/* Tools Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          const Icon = tool.icon;
          
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center p-3 rounded-lg text-left transition-colors
                ${isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <div>
                <div className="font-medium">{tool.name}</div>
                <div className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                  {tool.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;