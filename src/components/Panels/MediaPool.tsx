import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export const MediaPool: React.FC = () => {
  const { projectMedia } = useEditorStore();
  
  return (
    <div className="hidden" id="media-pool">
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
