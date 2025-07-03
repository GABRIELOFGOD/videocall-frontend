const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

export const createPeerConnection = (
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onRemoteStream: (stream: MediaStream) => void
): RTCPeerConnection => {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  
  pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };
  
  pc.ontrack = (event: RTCTrackEvent) => {
    onRemoteStream(event.streams[0]);
  };
  
  return pc;
};

export const getMediaStream = async (video: boolean = true, audio: boolean = true): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio });
  } catch (error) {
    console.error('Error accessing media:', error);
    throw error;
  }
};

export const getScreenShareStream = async (): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({ 
      video: true, 
      audio: true 
    });
  } catch (error) {
    console.error('Error accessing screen share:', error);
    throw error;
  }
};