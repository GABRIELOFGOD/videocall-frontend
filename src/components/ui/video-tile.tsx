"use client";

import { useEffect, useRef } from "react";

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isScreenShare?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({ 
  stream, 
  name, 
  isLocal = false, 
  isScreenShare = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-900 ${
      isScreenShare ? 'col-span-2 row-span-2' : ''
    }`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {name} {isLocal && '(You)'} {isScreenShare && '(Screen)'}
      </div>
    </div>
  );
};

export default VideoTile;