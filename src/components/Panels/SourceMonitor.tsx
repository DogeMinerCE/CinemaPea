import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Settings, 
  Maximize, 
  Volume2 
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export const SourceMonitor: React.FC = () => {
  const { selectedSourceMedia } = useEditorStore();
  const [isPlaying, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => setPlaying(!isPlaying);

  useEffect(() => {
    if (videoRef.current && selectedSourceMedia) {
      videoRef.current.src = selectedSourceMedia.url;
      videoRef.current.load();
      setPlaying(false);
      setCurrentTime(0);
    }
  }, [selectedSourceMedia]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => setPlaying(false));
      else videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full bg-black relative">
       {/* Video Viewport */}
       <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
          <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
            <video 
              ref={videoRef}
              className={`max-w-full max-h-full ${!selectedSourceMedia ? 'hidden' : ''}`}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            />
            {!selectedSourceMedia && (
              <div className="text-[11px] text-gray-500 opacity-30">Double click a clip in Project Panel to preview</div>
            )}
          </div>
       </div>

       {/* Playback Controls */}
       <div className="h-10 bg-[#1D1D1D] border-t border-black flex flex-col pt-1">
          {/* Progress Bar */}
          <div className="h-1 bg-[#333] w-full relative cursor-pointer">
            <div 
              className="absolute top-0 left-0 h-full bg-[#1473E6]"
              style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }}
            />
          </div>
          
          <div className="flex-1 flex items-center px-3 gap-4">
             <div className="text-[10px] text-gray-400 font-mono">
                {currentTime.toFixed(2)} / {videoRef.current?.duration.toFixed(2) || '0.00'}
             </div>
             
             <div className="flex-1 flex justify-center gap-4 text-gray-400">
                <SkipBack size={14} className="hover:text-white cursor-pointer" />
                <button onClick={togglePlay}>
                  {isPlaying ? <Pause size={14} className="text-[#1473E6]" /> : <Play size={14} className="hover:text-white" />}
                </button>
                <SkipForward size={14} className="hover:text-white cursor-pointer" />
             </div>
             
             <div className="flex gap-2 text-gray-500">
                <Volume2 size={12} />
                <Settings size={12} />
                <Maximize size={12} />
             </div>
          </div>
       </div>
    </div>
  );
};
