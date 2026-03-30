import { create } from 'zustand';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'audio' | 'image';
  duration: number;
  thumbnail?: string;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  trackId: string;
  startTime: number; // Start time on timeline
  inTime: number;    // Start time within media clip
  duration: number;
  zIndex: number;
}

export interface TimelineTrack {
  id: string;
  type: 'video' | 'audio';
  index: number;
  clips: TimelineClip[];
  muted: boolean;
  hidden: boolean;
}

export interface EditorState {
  projectMedia: MediaFile[];
  tracks: TimelineTrack[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  selectedTool: 'selection' | 'razor';
  selectedSourceMedia: MediaFile | null;
  draggingMedia: MediaFile | null;
  draggingClipId: string | null;
  
  // Actions
  addMedia: (file: MediaFile) => void;
  removeMedia: (id: string) => void;
  setSelectedSourceMedia: (media: MediaFile | null) => void;
  setDraggingMedia: (media: MediaFile | null) => void;
  setDraggingClipId: (clipId: string | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
  setTool: (tool: 'selection' | 'razor') => void;
  addTrack: (type: 'video' | 'audio') => void;
  addClipToTrack: (trackId: string, clip: TimelineClip) => void;
  updateClipPosition: (clipId: string, trackId: string, startTime: number) => void;
  splitClip: (trackId: string, clipId: string, timestamp: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  projectMedia: [],
  tracks: [
    { id: 'v1', type: 'video', index: 0, clips: [], muted: false, hidden: false },
    { id: 'a1', type: 'audio', index: 0, clips: [], muted: false, hidden: false },
  ],
  currentTime: 0,
  duration: 60, // Default 1 minute for now
  isPlaying: false,
  selectedTool: 'selection',
  selectedSourceMedia: null,
  draggingMedia: null,
  draggingClipId: null,

  addMedia: (file) => set((state) => ({ 
    projectMedia: [...state.projectMedia, file] 
  })),

  removeMedia: (id) => set((state) => ({ 
    projectMedia: state.projectMedia.filter(m => m.id !== id) 
  })),

  setSelectedSourceMedia: (media) => set({ selectedSourceMedia: media }),
  
  setDraggingMedia: (media) => set({ draggingMedia: media }),
  
  setDraggingClipId: (clipId) => set({ draggingClipId: clipId }),

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setDuration: (duration: number) => set({ duration }),

  setTool: (tool) => set({ selectedTool: tool }),

  addTrack: (type) => set((state) => {
    const newIdx = state.tracks.filter(t => t.type === type).length;
    const newTrack: TimelineTrack = {
      id: `${type[0]}${newIdx + 1}`,
      type,
      index: newIdx,
      clips: [],
      muted: false,
      hidden: false
    };
    return { tracks: [...state.tracks, newTrack] };
  }),

  addClipToTrack: (trackId, clip) => set((state) => ({
    tracks: state.tracks.map(t => 
      t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
    )
  })),

  updateClipPosition: (clipId, trackId, startTime) => set((state) => ({
    tracks: state.tracks.map(t => ({
      ...t,
      clips: t.clips.map(c => 
        c.id === clipId ? { ...c, trackId, startTime } : c
      )
    }))
  })),

  splitClip: (trackId, clipId, timestamp) => set((state) => ({
    tracks: state.tracks.map(t => {
      if (t.id !== trackId) return t;
      
      const clipIndex = t.clips.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return t;
      
      const clip = t.clips[clipIndex];
      const relativeSplitTime = timestamp - clip.startTime;
      
      if (relativeSplitTime <= 0 || relativeSplitTime >= clip.duration) return t;
      
      const newClips = [...t.clips];
      // Update original clip
      newClips[clipIndex] = { ...clip, duration: relativeSplitTime };
      
      // Add new clip
      newClips.push({
        id: Math.random().toString(36).substr(2, 9),
        mediaId: clip.mediaId,
        trackId: clip.trackId,
        startTime: timestamp,
        inTime: clip.inTime + relativeSplitTime,
        duration: clip.duration - relativeSplitTime,
        zIndex: clip.zIndex
      });
      
      return { ...t, clips: newClips };
    })
  })),
}));
