export interface MediaMetadata {
  duration: number;
  width: number;
  height: number;
  thumbnail: string;
}

export class MediaEngine {
  static async getMetadata(file: File): Promise<MediaMetadata> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          // Seek to 1 second to get a thumbnail
          video.currentTime = Math.min(1, video.duration / 2);
        };
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          resolve({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            thumbnail: canvas.toDataURL('image/jpeg', 0.7),
          });
          
          URL.revokeObjectURL(video.src);
        };
        
        video.onerror = reject;
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({
            duration: 0,
            width: img.width,
            height: img.height,
            thumbnail: URL.createObjectURL(file), // Images are their own thumbnails
          });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('audio/')) {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
          resolve({
            duration: audio.duration,
            width: 0,
            height: 0,
            thumbnail: '', // Audio doesn't have a thumbnail
          });
          URL.revokeObjectURL(audio.src);
        };
        audio.onerror = reject;
        audio.src = URL.createObjectURL(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  }
}
