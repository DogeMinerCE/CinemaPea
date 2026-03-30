import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Eye, 
  Lock
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export const Timeline: React.FC = () => {
  const { 
    tracks, 
    currentTime, 
    duration, 
    setCurrentTime, 
    isPlaying, 
    setPlaying, 
    projectMedia, 
    addClipToTrack, 
    updateClipPosition,
    splitClip,
    selectedTool
  } = useEditorStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1); // Pixels per second

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')};${f.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const newTime = x / (10 * zoom); // 10px per second initially
    setCurrentTime(Math.min(duration, Math.max(0, newTime)));
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const mediaId = e.dataTransfer.getData('mediaId');
    const clipId = e.dataTransfer.getData('clipId');
    
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const startTime = Math.max(0, x / (10 * zoom));

    if (clipId) {
      // Moving existing clip
      updateClipPosition(clipId, trackId, startTime);
    } else if (mediaId) {
      // Adding new clip
      const media = projectMedia.find(m => m.id === mediaId);
      if (!media) return;

      addClipToTrack(trackId, {
        id: Math.random().toString(36).substr(2, 9),
        mediaId,
        trackId,
        startTime,
        inTime: 0,
        duration: media.duration || 5, 
        zIndex: 1,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-gray-400">
      {/* ... Timeline Toolbar ... */}
      <div className="h-8 bg-[#2d2d2d] border-b border-black flex items-center px-4 gap-4">
        <div className="flex gap-2 items-center">
          <SkipBack size={14} className="hover:text-white cursor-pointer" />
          <button onClick={() => setPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={14} className="text-[#1473E6]" /> : <Play size={14} className="hover:text-white" />}
          </button>
          <SkipForward size={14} className="hover:text-white cursor-pointer" />
        </div>
        
        <div className="h-4 w-[1px] bg-black" />
        
        <div className="text-[12px] font-mono text-[#00FF00]">
          {formatTime(currentTime)}
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0.1" 
            max="10" 
            step="0.1" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ... Track Headers ... */}
        <div className="w-[120px] bg-[#1a1a1a] border-r border-black flex flex-col pt-[24px]">
          {/* Video Tracks */}
          {tracks.filter(t => t.type === 'video').reverse().map(track => (
            <div key={track.id} className="h-16 border-b border-black flex flex-col justify-center px-2 gap-1 group">
              <span className="text-[9px] font-bold">{track.id.toUpperCase()}</span>
              <div className="flex gap-2 opacity-50 group-hover:opacity-100">
                <Eye size={10} />
                <Lock size={10} />
              </div>
            </div>
          ))}
          
          <div className="h-4 bg-[#0a0a0a]" />

          {/* Audio Tracks */}
          {tracks.filter(t => t.type === 'audio').map(track => (
            <div key={track.id} className="h-16 border-b border-black flex flex-col justify-center px-2 gap-1 group">
              <span className="text-[9px] font-bold">{track.id.toUpperCase()}</span>
              <div className="flex gap-2 opacity-50 group-hover:opacity-100">
                <Volume2 size={10} />
                <Lock size={10} />
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Viewport */}
        <div 
          className="flex-1 relative overflow-x-auto overflow-y-hidden"
          ref={timelineRef}
          onClick={handleTimelineClick}
        >
          {/* ... Time Ruler ... */}
          <div className="h-6 bg-[#252525] border-b border-black relative sticky top-0 z-20">
             {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bottom-0 border-l border-gray-600"
                  style={{ left: `${i * 10 * zoom}px`, height: i % 5 === 0 ? '50%' : '20%' }}
                >
                  {i % 5 === 0 && <span className="absolute -top-4 -left-2 text-[8px]">{i}s</span>}
                </div>
             ))}
          </div>

          <div className="flex flex-col relative" style={{ width: `${duration * 10 * zoom}px` }}>
            {/* Track Content */}
            {tracks.filter(t => t.type === 'video').reverse().map(track => (
              <div 
                key={track.id} 
                className="h-16 border-b border-black bg-[#222222] relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, track.id)}
              >
                {track.clips.map(clip => {
                  const media = projectMedia.find(m => m.id === clip.mediaId);
                  const isRazor = selectedTool === 'razor';
                  
                  return (
                    <div 
                      key={clip.id}
                      draggable={!isRazor}
                      onDragStart={(e) => {
                        if (isRazor) return;
                        e.dataTransfer.setData('clipId', clip.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={(e) => {
                        if (isRazor) {
                          e.stopPropagation();
                          splitClip(track.id, clip.id, currentTime);
                        }
                      }}
                      className={`absolute h-[80%] top-[10%] bg-[#486380] border border-[#1473E6] rounded-sm overflow-hidden text-white flex items-center gap-1 group transition-all duration-75 ${isRazor ? 'cursor-crosshair hover:bg-[#5a7ba0]' : 'cursor-move hover:brightness-110'}`}
                      style={{ 
                        left: `${clip.startTime * 10 * zoom}px`, 
                        width: `${clip.duration * 10 * zoom}px`
                      }}
                    >
                      {media?.thumbnail && <img src={media.thumbnail} className="h-full w-10 object-cover opacity-50 pointer-events-none" />}
                      <span className="text-[8px] truncate drop-shadow-md pointer-events-none">{media?.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="h-4 bg-[#0a0a0a]" />

             {tracks.filter(t => t.type === 'audio').map(track => (
              <div 
                key={track.id} 
                className="h-16 border-b border-black bg-[#1a1a1a] relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, track.id)}
              >
                {track.clips.map(clip => {
                  const media = projectMedia.find(m => m.id === clip.mediaId);
                  const isRazor = selectedTool === 'razor';

                  return (
                    <div 
                      key={clip.id}
                      draggable={!isRazor}
                      onDragStart={(e) => {
                        if (isRazor) return;
                        e.dataTransfer.setData('clipId', clip.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={(e) => {
                        if (isRazor) {
                          e.stopPropagation();
                          splitClip(track.id, clip.id, currentTime);
                        }
                      }}
                      className={`absolute h-[80%] top-[10%] bg-[#364936] border border-[#3e8e41] rounded-sm overflow-hidden text-white flex items-center px-2 transition-all duration-75 ${isRazor ? 'cursor-crosshair hover:bg-[#4a634a]' : 'cursor-move hover:brightness-110'}`}
                      style={{ 
                        left: `${clip.startTime * 10 * zoom}px`, 
                        width: `${clip.duration * 10 * zoom}px`
                      }}
                    >
                      <span className="text-[8px] truncate pointer-events-none">{media?.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-30 pointer-events-none"
              style={{ left: `${currentTime * 10 * zoom}px` }}
            >
              <div className="w-3 h-3 bg-red-500 absolute -top-1 -translate-x-1/2 rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
