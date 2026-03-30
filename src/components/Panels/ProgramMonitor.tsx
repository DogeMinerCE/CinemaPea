import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Settings, 
  Maximize, 
  Volume2,
  Camera
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import type { EditorState, TimelineClip, TimelineTrack } from '../../store/useEditorStore';

export const ProgramMonitor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>();

  // Only subscribe to things that should trigger a React re-render of this component's controls
  const isPlaying = useEditorStore((state: EditorState) => state.isPlaying);
  const setPlaying = useEditorStore((state: EditorState) => state.setPlaying);
  const currentTime = useEditorStore((state: EditorState) => state.currentTime);
  const setCurrentTime = useEditorStore((state: EditorState) => state.setCurrentTime);
  const duration = useEditorStore((state: EditorState) => state.duration);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')};${f.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const render = (time: number) => {
      const state = useEditorStore.getState();
      const currentPlaying = state.isPlaying;
      const currentDuration = state.duration;
      const currentTracks = state.tracks;
      const currentMedia = state.projectMedia;
      let cTime = state.currentTime;

      if (currentPlaying) {
        if (lastTimeRef.current !== undefined) {
          const deltaTime = (time - lastTimeRef.current) / 1000;
          cTime = Math.min(currentDuration, cTime + deltaTime);
          state.setCurrentTime(cTime);
          if (cTime >= currentDuration) state.setPlaying(false);
        }
        lastTimeRef.current = time;
      } else {
        lastTimeRef.current = undefined;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const sortedTracks = [...currentTracks].sort((a: TimelineTrack, b: TimelineTrack) => a.index - b.index);
          sortedTracks.forEach((track: TimelineTrack) => {
            if (track.hidden || track.type !== 'video') return;
            track.clips.forEach((clip: TimelineClip) => {
              const isSelected = cTime >= clip.startTime && cTime < clip.startTime + clip.duration;
              if (isSelected) {
                const media = currentMedia.find(m => m.id === clip.mediaId);
                if (media) {
                  const el = document.getElementById(media.type === 'video' ? `video-${media.id}` : `image-${media.id}`) as any;
                  if (el) {
                    if (media.type === 'video') {
                      const localTime = (cTime - clip.startTime) + clip.inTime;
                      if (Math.abs(el.currentTime - localTime) > 0.1) el.currentTime = localTime;
                    }
                    ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
                  }
                }
              }
            });
          });
        }
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Only once, use getState internally

  return (
    <div className="flex flex-col h-full bg-black relative">
       {/* Video Viewport */}
       <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
          <canvas 
            ref={canvasRef}
            width={1920}
            height={1080}
            className="w-full h-full max-w-full max-h-full object-contain shadow-2xl"
          />
       </div>

       {/* Playback Controls */}
       <div className="h-10 bg-[#1D1D1D] border-t border-black flex flex-col pt-1">
          {/* Progress Bar */}
          <div className="h-1 bg-[#333] w-full relative cursor-pointer pt-1" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setCurrentTime((x / rect.width) * duration);
          }}>
            <div 
              className="absolute top-0 left-0 h-full bg-[#1473E6]"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <div className="flex-1 flex items-center px-3 gap-4">
             <div className="text-[10px] text-[#1473E6] font-mono font-bold">
                {formatTime(currentTime)}
             </div>
             
             <div className="flex-1 flex justify-center gap-4 text-gray-400">
                <SkipBack size={14} className="hover:text-white cursor-pointer" onClick={() => setCurrentTime(0)} />
                <button onClick={() => setPlaying(!isPlaying)}>
                  {isPlaying ? <Pause size={14} className="text-[#1473E6]" /> : <Play size={14} className="hover:text-white" />}
                </button>
                <SkipForward size={14} className="hover:text-white cursor-pointer" onClick={() => setCurrentTime(duration)} />
             </div>
             
             <div className="flex gap-2 text-gray-500">
                <Camera size={12} />
                <Volume2 size={12} />
                <Settings size={12} />
                <Maximize size={12} />
             </div>
          </div>
       </div>
    </div>
  );
};
