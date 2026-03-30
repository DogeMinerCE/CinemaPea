import React from 'react';
import { 
  MousePointer2, 
  Scissors, 
  Hand, 
  Type, 
  PenTool, 
  MoveHorizontal, 
  Magnet 
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export const ToolsBar: React.FC = () => {
  const selectedTool = useEditorStore(state => state.selectedTool);
  const setTool = useEditorStore(state => state.setTool);

  return (
    <div className="w-[32px] bg-[#1D1D1D] border-r border-black flex flex-col items-center py-2 gap-2">
      <button 
        title="Selection Tool (V)"
        onClick={() => setTool('selection')}
        className={`p-1 rounded-sm ${selectedTool === 'selection' ? 'bg-[#1473E6] text-white' : 'text-gray-400 hover:text-gray-200'}`}
      >
        <MousePointer2 size={16} />
      </button>

      <button 
        title="Razor Tool (C)"
        onClick={() => setTool('razor')}
        className={`p-1 rounded-sm ${selectedTool === 'razor' ? 'bg-[#1473E6] text-white' : 'text-gray-400 hover:text-gray-200'}`}
      >
        <Scissors size={16} />
      </button>

      <div className="w-4 h-[1px] bg-black my-1" />

      <button className="p-1 rounded-sm text-gray-400 hover:text-gray-200">
        <PenTool size={16} />
      </button>

      <button className="p-1 rounded-sm text-gray-400 hover:text-gray-200">
        <Hand size={16} />
      </button>

      <button className="p-1 rounded-sm text-gray-400 hover:text-gray-200">
        <Type size={16} />
      </button>
      
      <div className="flex-1" />

      <button className="p-1 rounded-sm text-gray-400 hover:text-gray-200" title="Snap (S)">
        <Magnet size={16} />
      </button>
    </div>
  );
};
