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
  const [isScrubbing, setIsScrubbing] = useState(false);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')};${f.toString().padStart(2, '0')}`;
  };

  const seekAtPixel = (clientX: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left + timelineRef.current.scrollLeft;
    const newTime = x / (10 * zoom);
    setCurrentTime(Math.min(duration, Math.max(0, newTime)));
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    // Only scrub if clicking ruler or empty area
    const isRuler = (e.target as HTMLElement).closest('.time-ruler-zone');
    if (isRuler) {
      setIsScrubbing(true);
      seekAtPixel(e.clientX);
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        seekAtPixel(e.clientX);
      }
    };
    const handleMouseUp = () => setIsScrubbing(false);

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, zoom]);

  // Keyboard Shortcuts & Auto-scroll
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          setCurrentTime(Math.max(0, currentTime - (e.shiftKey ? 5 : 1 / 30)));
          break;
        case 'ArrowRight':
          setCurrentTime(Math.min(duration, currentTime + (e.shiftKey ? 5 : 1 / 30)));
          break;
        case 'Home':
          setCurrentTime(0);
          break;
        case 'End':
          setCurrentTime(duration);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-scroll logic
    if (isPlaying && timelineRef.current) {
        const viewport = timelineRef.current;
        const playheadX = currentTime * 10 * zoom;
        const scrollLeft = viewport.scrollLeft;
        const width = viewport.clientWidth;

        if (playheadX > scrollLeft + width - 50) {
            viewport.scrollLeft = playheadX - 100;
        } else if (playheadX < scrollLeft) {
            viewport.scrollLeft = playheadX;
        }
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, zoom]);

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const state = useEditorStore.getState();
    const mediaId = e.dataTransfer.getData('application/x-media-id') || e.dataTransfer.getData('mediaid') || e.dataTransfer.getData('mediaId') || state.draggingMedia?.id;
    const clipId = e.dataTransfer.getData('application/x-clip-id') || e.dataTransfer.getData('clipid') || e.dataTransfer.getData('clipId') || state.draggingClipId;
    
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
            onChange={(e) => setZoom(parseFloat(e.target.value) || 1)}
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
          onMouseDown={handleTimelineMouseDown}
          onDragEnter={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            if (e.target === timelineRef.current || (e.target as HTMLElement).closest('.time-ruler-zone')) {
              handleDrop(e, 'v1'); // Default to Video 1
            }
          }}
        >
          {/* ... Time Ruler ... */}
          <div className="h-6 bg-[#252525] border-b border-black relative sticky top-0 z-20 time-ruler-zone" style={{ position: 'sticky', top: 0 }}>
             {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bottom-0 border-l border-gray-600"
                  style={{ position: 'absolute', bottom: 0, borderLeft: '1px solid #4b5563', left: `${i * 10 * zoom}px`, height: i % 5 === 0 ? '50%' : '20%' }}
                >
                  {i % 5 === 0 && <span className="absolute -top-4 -left-2 text-[8px]" style={{ position: 'absolute', top: '-16px', left: '-8px' }}>{i}s</span>}
                </div>
             ))}
          </div>

          <div className="flex flex-col relative" style={{ minWidth: '100%', width: `${duration * 10 * zoom}px` }}>
            {/* Track Content */}
            {tracks.filter(t => t.type === 'video').reverse().map(track => (
              <div 
                key={track.id} 
                className="h-16 border-b border-black bg-[#222222] relative"
                style={{ height: '64px', overflow: 'hidden', position: 'relative', borderBottom: '1px solid black', backgroundColor: '#222222' }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
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
                        e.dataTransfer.setData('application/x-clip-id', clip.id);
                        e.dataTransfer.effectAllowed = 'move';
                        useEditorStore.getState().setDraggingClipId(clip.id);
                      }}
                      onDragEnd={() => {
                        useEditorStore.getState().setDraggingClipId(null);
                      }}
                      onClick={(e) => {
                        if (isRazor) {
                          e.stopPropagation();
                          splitClip(track.id, clip.id, currentTime);
                        }
                      }}
                      className={`absolute h-[80%] top-[10%] bg-[#486380] border border-[#1473E6] rounded-sm overflow-hidden text-white flex items-center gap-1 group transition-all duration-75 ${isRazor ? 'cursor-crosshair hover:bg-[#5a7ba0]' : 'cursor-move hover:brightness-110'}`}
                      style={{ 
                        left: `${(Number(clip.startTime) || 0) * 10 * (Number(zoom) || 1)}px`, 
                        width: `${(Number(clip.duration) || 5) * 10 * (Number(zoom) || 1)}px`,
                        position: 'absolute', top: '10%', height: '80%', overflow: 'hidden', display: 'flex', alignItems: 'center'
                      }}
                    >
                      {media?.thumbnail && <img src={media.thumbnail} className="h-full w-10 object-cover opacity-50 pointer-events-none" style={{ width: '40px', height: '100%', objectFit: 'cover', flexShrink: 0 }} />}
                      <span className="text-[8px] truncate drop-shadow-md pointer-events-none" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{media?.name}</span>
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
                style={{ height: '64px', overflow: 'hidden', position: 'relative', borderBottom: '1px solid black', backgroundColor: '#1a1a1a' }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
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
                        e.dataTransfer.setData('application/x-clip-id', clip.id);
                        e.dataTransfer.effectAllowed = 'move';
                        useEditorStore.getState().setDraggingClipId(clip.id);
                      }}
                      onDragEnd={() => {
                        useEditorStore.getState().setDraggingClipId(null);
                      }}
                      onClick={(e) => {
                        if (isRazor) {
                          e.stopPropagation();
                          splitClip(track.id, clip.id, currentTime);
                        }
                      }}
                      className={`absolute h-[80%] top-[10%] bg-[#364936] border border-[#3e8e41] rounded-sm overflow-hidden text-white flex items-center px-2 transition-all duration-75 ${isRazor ? 'cursor-crosshair hover:bg-[#4a634a]' : 'cursor-move hover:brightness-110'}`}
                      style={{ 
                        left: `${(Number(clip.startTime) || 0) * 10 * (Number(zoom) || 1)}px`, 
                        width: `${(Number(clip.duration) || 5) * 10 * (Number(zoom) || 1)}px`,
                        position: 'absolute', top: '10%', height: '80%', overflow: 'hidden', display: 'flex', alignItems: 'center'
                      }}
                    >
                      <span className="text-[8px] truncate pointer-events-none" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{media?.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-[1px] bg-[#FF0000] z-30 pointer-events-none"
              style={{ left: `${currentTime * 10 * zoom}px`, boxShadow: '0 0 4px rgba(255,0,0,0.5)' }}
            >
              {/* Playhead Handle */}
              <div 
                className="w-4 h-6 bg-[#FF0000] absolute -top-[24px] -translate-x-1/2 cursor-grab active:cursor-grabbing flex items-center justify-center rounded-t-sm"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)' }}
              >
                <div className="w-[1px] h-3 bg-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
