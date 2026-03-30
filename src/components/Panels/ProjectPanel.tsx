import React, { useRef } from 'react';
import { Upload, Plus, Search, List, LayoutGrid } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { MediaEngine } from '../../engine/MediaEngine';

export const ProjectPanel: React.FC = () => {
  const { projectMedia, addMedia, setSelectedSourceMedia } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isAudio && !isImage) continue;

      try {
        const metadata = await MediaEngine.getMetadata(file);
        const url = URL.createObjectURL(file);

        const mediaFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          url,
          type: isVideo ? 'video' : isAudio ? 'audio' : 'image' as any,
          duration: metadata.duration,
          thumbnail: metadata.thumbnail,
        };

        addMedia(mediaFile);
      } catch (err) {
        console.error('Failed to load media metadata:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full text-gray-300">
      {/* Panel Toolbar */}
      <div className="flex items-center px-3 py-1 border-b border-black gap-2 bg-[#2D2D2D]">
        <Search size={12} className="opacity-50" />
        <input 
          type="text" 
          placeholder="Search" 
          className="bg-transparent border-none outline-none text-[10px] flex-1"
        />
        <div className="flex gap-2 opacity-50">
          <List size={14} />
          <LayoutGrid size={14} />
        </div>
      </div>

      {/* Media List */}
      <div 
        className="flex-1 p-3 overflow-auto flex flex-wrap gap-3 content-start"
        onDoubleClick={(e) => {
          if (e.target === e.currentTarget) fileInputRef.current?.click();
        }}
      >
        {projectMedia.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-30 gap-2">
            <Upload size={32} />
            <p className="text-[11px]">Import media to start</p>
          </div>
        ) : (
          projectMedia.map((media) => (
            <div 
              key={media.id}
              className="w-24 group flex flex-col gap-1 cursor-pointer"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('mediaId', media.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setSelectedSourceMedia(media);
              }}
            >
              <div className="aspect-video bg-black border border-gray-700 rounded-sm overflow-hidden flex items-center justify-center relative">
                {media.type === 'video' && <div className="absolute top-1 right-1 px-1 bg-black/60 rounded text-[8px]">VIDEO</div>}
                {media.thumbnail ? (
                  <img src={media.thumbnail} className="w-full h-full object-cover" alt={media.name} />
                ) : (
                  media.type === 'audio' ? <div className="text-[20px] opacity-30">♫</div> : null
                )}
              </div>
              <p className="text-[9px] truncate px-1 group-hover:text-blue-400">{media.name}</p>
            </div>
          ))
        )}
      </div>

      {/* Bottom Bar */}
      <div className="h-6 border-t border-black bg-[#232323] flex items-center px-4 gap-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="hover:text-white"
        >
          <Plus size={14} />
        </button>
        <input 
          type="file" 
          multiple 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileUpload}
          accept="video/*,audio/*,image/*"
        />
      </div>
    </div>
  );
};
