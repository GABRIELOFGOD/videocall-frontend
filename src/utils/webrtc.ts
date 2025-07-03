// const ICE_SERVERS: RTCIceServer[] = [
//   { urls: 'stun:stun.l.google.com:19302' },
//   { urls: 'stun:stun1.l.google.com:19302' }
// ];

// export const createPeerConnection = (
//   onIceCandidate: (candidate: RTCIceCandidate) => void,
//   onRemoteStream: (stream: MediaStream) => void
// ): RTCPeerConnection => {
//   const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  
//   pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
//     if (event.candidate) {
//       onIceCandidate(event.candidate);
//     }
//   };
  
//   pc.ontrack = (event: RTCTrackEvent) => {
//     onRemoteStream(event.streams[0]);
//   };
  
//   return pc;
// };

// export const getMediaStream = async (video: boolean = true, audio: boolean = true): Promise<MediaStream> => {
//   try {
//     return await navigator.mediaDevices.getUserMedia({ video, audio });
//   } catch (error) {
//     console.error('Error accessing media:', error);
//     throw error;
//   }
// };

// export const getScreenShareStream = async (): Promise<MediaStream> => {
//   try {
//     return await navigator.mediaDevices.getDisplayMedia({ 
//       video: true, 
//       audio: true 
//     });
//   } catch (error) {
//     console.error('Error accessing screen share:', error);
//     throw error;
//   }
// };

// @/utils/webrtc.ts

// WebRTC Configuration
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

// Create RTCPeerConnection
export const createPeerConnection = (
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onRemoteStream: (stream: MediaStream) => void
): RTCPeerConnection => {
  const peerConnection = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
  });

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    console.log('Received remote track:', event.track.kind);
    if (event.streams && event.streams[0]) {
      onRemoteStream(event.streams[0]);
    }
  };

  // Handle connection state changes
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state:', peerConnection.connectionState);
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', peerConnection.iceConnectionState);
  };

  return peerConnection;
};

// Get user media stream with better error handling
export const getMediaStream = async (constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> => {
  try {
    // Try to get media with the provided constraints
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Got media stream:', stream);
    return stream;
  } catch (error) {
    console.error('Error getting user media:', error);
    
    // If initial request fails, try with more permissive settings
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          throw new Error('Camera/microphone access denied. Please allow access and try again.');
        
        case 'NotFoundError':
          // Try audio only if no video device
          if (constraints.video) {
            console.log('No video device found, trying audio only');
            try {
              return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            } catch (audioError) {
              console.log("[AUDIOERROR]: ", audioError);
              throw new Error('No camera or microphone found on this device.');
            }
          }
          throw new Error('No camera or microphone found on this device.');
        
        case 'NotReadableError':
          throw new Error('Camera/microphone is already in use by another application.');
        
        case 'OverconstrainedError':
          // Try with less restrictive constraints
          console.log('Constraints too restrictive, trying with defaults');
          try {
            return await navigator.mediaDevices.getUserMedia({
              video: constraints.video ? { width: 640, height: 480 } : false,
              audio: constraints.audio ? true : false
            });
          } catch (fallbackError) {
            console.log("[FALLBACKERROR]: ", fallbackError);
            throw new Error('Unable to access camera/microphone with current settings.');
          }
        
        default:
          throw new Error(`Media access error: ${error.message}`);
      }
    }
    
    throw error;
  }
};

// Get screen share stream
export const getScreenShareStream = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        logicalSurface: true,
        cursor: 'always'
      } as MediaTrackConstraints,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });
    
    console.log('Got screen share stream:', stream);
    return stream;
  } catch (error) {
    console.error('Error getting screen share:', error);
    
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          throw new Error('Screen sharing access denied.');
        case 'NotFoundError':
          throw new Error('No screen available for sharing.');
        default:
          throw new Error(`Screen sharing error: ${error.message}`);
      }
    }
    
    throw error;
  }
};

// Create a test/fake stream for development (to avoid device conflicts)
export const createTestStream = (): MediaStream => {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  
  // Create a simple pattern
  if (ctx) {
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Video', canvas.width / 2, canvas.height / 2);
  }
  
  // Create stream from canvas
  const stream = canvas.captureStream(30);
  
  // Add a fake audio track
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0.01; // Very low volume
  oscillator.frequency.value = 440; // A4 note
  oscillator.start();
  
  // Create MediaStreamAudioDestinationNode to get audio track
  const audioDestination = audioContext.createMediaStreamDestination();
  gainNode.connect(audioDestination);
  
  // Add audio track to the stream
  audioDestination.stream.getAudioTracks().forEach(track => {
    stream.addTrack(track);
  });
  
  return stream;
};

// Check if user media is supported
export const isUserMediaSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Check if screen sharing is supported
export const isScreenShareSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
};

// Get available media devices
export const getAvailableDevices = async (): Promise<MediaDeviceInfo[]> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices;
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return [];
  }
};