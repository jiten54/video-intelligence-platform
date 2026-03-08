import React from 'react';
import YouTube from 'react-youtube';
import { Video } from 'lucide-react';

export const VideoPlayer = ({ videoId, title }) => {
  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="glassmorphism rounded-2xl overflow-hidden shadow-2xl" data-testid="video-player-container">
      <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <Video className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-semibold text-lg text-text-primary line-clamp-1">{title}</h2>
      </div>
      <div className="aspect-video bg-black">
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;