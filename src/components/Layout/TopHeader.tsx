import { useEditorStore } from '../../store/useEditorStore';
import { ExportManager } from '../../engine/ExportManager';
import { useState } from 'react';

export const TopHeader: React.FC = () => {
  const { tracks, projectMedia } = useEditorStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const exporter = new ExportManager();
    try {
      const allClips = tracks.flatMap(t => t.clips);
      const url = await exporter.exportSequence(allClips, projectMedia);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CinemaPea_Export.mp4';
      a.click();
    } catch (err) {
      console.error(err);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-7 bg-[#232323] border-b border-black flex items-center px-2 gap-4 text-[11px] text-gray-300">
      <div className="flex items-center gap-3">
        <span className="font-bold text-white px-2">CinemaPea</span>
        <div className="flex gap-3 px-2">
          <span className="cursor-default hover:text-white transition-colors duration-100">File</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">Edit</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">Clip</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">Sequence</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">Markers</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">Graphics</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">View</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">Window</span>
          <span className="cursor-default hover:text-white transition-colors duration-100">Help</span>
        </div>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex gap-4 items-center pr-4">
        <span className="text-[#1473E6] font-bold">Editing</span>
        <span className="opacity-50">Color</span>
        <span className="opacity-50">Effects</span>
        <span className="opacity-50">Audio</span>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className={`px-3 h-5 bg-[#0078D4] text-white rounded-sm hover:bg-[#005a9e] transition-colors ${isExporting ? 'opacity-50' : ''}`}
        >
          {isExporting ? 'EXPORTING...' : 'EXPORT'}
        </button>
      </div>
    </div>
  );
};
