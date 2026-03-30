import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export const MediaPool: React.FC = () => {
  const { projectMedia } = useEditorStore();
  
  return (
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }} id="media-pool">
      {projectMedia.map(media => {
        if (media.type === 'video' || media.type === 'audio') {
          return (
            <video 
              key={media.id} 
              id={`video-${media.id}`} 
              src={media.url} 
              preload="auto" 
              muted 
            />
          );
        }
        if (media.type === 'image') {
          return (
            <img 
              key={media.id} 
              id={`image-${media.id}`} 
              src={media.url} 
            />
          );
        }
        return null;
      })}
    </div>
  );
};
