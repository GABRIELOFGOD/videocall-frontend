// "use client";

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff, Users } from 'lucide-react';
// import VideoTile from './ui/video-tile';
// import ControlButton from './ui/control-button';
// import {
//   SignalingMessage,
//   CallState,
//   User
// } from '@/types/webrtc';
// import { createPeerConnection, getMediaStream, getScreenShareStream } from '@/utils/webrtc';
// import { SignalingService } from '@/utils/signaling';
// import RoomJoinConfirmation from './room-join-confirmation';
// import { BASEURL } from '@/utils/constants';

// const signalingService = new SignalingService();

// interface VideoCallPageProps {
//   roomId?: string;
// }

// const VideoCallPage: React.FC<VideoCallPageProps> = ({ roomId = 'room-123' }) => {
//   const [callState, setCallState] = useState<CallState>({
//     localStream: null,
//     remoteStreams: new Map(),
//     peers: new Map(),
//     isVideoOn: true,
//     isAudioOn: true,
//     isScreenSharing: false,
//     connectedPeers: [],
//     callStatus: 'connecting',
//     roomConfirmation: false,
//   });
  
//   // Refs with proper typing
//   const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
//   const screenShareStream = useRef<MediaStream | null>(null);
//   const localUserId = useRef<string>('');

//   const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
//     console.log('Received signaling message:', message.type, message);
    
//     switch (message.type) {
//       case 'joined-room':
//         // Handle successful room join
//         if (message.roomInfo) {
//           console.log('Joined room successfully:', message.roomInfo);
//           setCallState(prev => ({
//             ...prev,
//             connectedPeers: message.roomInfo!.participants.filter((p: User) => p.id !== localUserId.current),
//             callStatus: 'connected',
//             roomConfirmation: true
//           }));
          
//           // Create peer connections for existing users (excluding ourselves)
//           const existingPeers = message.roomInfo.participants.filter((p: User) => p.id !== localUserId.current);
//           for (const peer of existingPeers) {
//             console.log('Creating peer connection for existing user:', peer.id);
//             await createPeerConnectionForUser(peer.id, true); // true = initiate offer
//           }
//         }
//         break;
        
//       case 'peer-joined':
//         // Handle new peer joining
//         if (message.peerId && message.data) {
//           console.log('New peer joined:', message.peerId, message.data);
//           setCallState(prev => ({
//             ...prev,
//             connectedPeers: [...prev.connectedPeers, message.data!]
//           }));
          
//           // Create peer connection for new user (don't initiate offer, wait for their offer)
//           await createPeerConnectionForUser(message.peerId, false);
//         }
//         break;
        
//       case 'offer':
//         if (message.offer && message.peerId) {
//           console.log('Received offer from:', message.peerId);
//           await handleOffer(message.offer, message.peerId);
//         }
//         break;
        
//       case 'answer':
//         if (message.answer && message.peerId) {
//           console.log('Received answer from:', message.peerId);
//           await handleAnswer(message.answer, message.peerId);
//         }
//         break;
        
//       case 'ice-candidate':
//         if (message.candidate && message.peerId) {
//           console.log('Received ICE candidate from:', message.peerId);
//           await handleIceCandidate(message.candidate, message.peerId);
//         }
//         break;
        
//       case 'peer-left':
//         if (message.peerId) {
//           console.log('Peer left:', message.peerId);
//           handlePeerLeft(message.peerId);
//         }
//         break;
//     }
//   }, []);
  
//   // Create peer connection for new user
//   const createPeerConnectionForUser = async (peerId: string, shouldInitiateOffer: boolean = false): Promise<void> => {
//     try {
//       console.log('Creating peer connection for:', peerId, 'shouldInitiateOffer:', shouldInitiateOffer);
      
//       // Don't create duplicate connections
//       if (peerConnections.current.has(peerId)) {
//         console.log('Peer connection already exists for:', peerId);
//         return;
//       }
      
//       const pc = createPeerConnection(
//         (candidate: RTCIceCandidate) => {
//           console.log('Sending ICE candidate to:', peerId);
//           signalingService.send({
//             type: 'ice-candidate',
//             candidate,
//             target: peerId
//           });
//         },
//         (stream: MediaStream) => {
//           console.log('Received remote stream from:', peerId);
//           setCallState(prev => ({
//             ...prev,
//             remoteStreams: new Map(prev.remoteStreams.set(peerId, stream))
//           }));
//         }
//       );
      
//       // Add local stream to peer connection
//       if (callState.localStream) {
//         callState.localStream.getTracks().forEach((track: MediaStreamTrack) => {
//           console.log('Adding local track to peer connection:', track.kind);
//           pc.addTrack(track, callState.localStream!);
//         });
//       }
      
//       peerConnections.current.set(peerId, pc);
      
//       // Create and send offer only if we should initiate
//       if (shouldInitiateOffer) {
//         console.log('Creating offer for:', peerId);
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
        
//         signalingService.send({
//           type: 'offer',
//           offer,
//           target: peerId
//         });
//       }
//     } catch (error) {
//       console.error('Error creating peer connection for', peerId, ':', error);
//     }
//   };
  
//   // Handle incoming offer
//   const handleOffer = async (offer: RTCSessionDescriptionInit, from: string): Promise<void> => {
//     try {
//       console.log('Handling offer from:', from);
      
//       let pc = peerConnections.current.get(from);
      
//       // Create peer connection if it doesn't exist
//       if (!pc) {
//         console.log('Creating new peer connection for incoming offer from:', from);
//         pc = createPeerConnection(
//           (candidate: RTCIceCandidate) => {
//             signalingService.send({
//               type: 'ice-candidate',
//               candidate,
//               target: from
//             });
//           },
//           (stream: MediaStream) => {
//             setCallState(prev => ({
//               ...prev,
//               remoteStreams: new Map(prev.remoteStreams.set(from, stream))
//             }));
//           }
//         );
        
//         // Add local stream
//         if (callState.localStream) {
//           callState.localStream.getTracks().forEach((track: MediaStreamTrack) => {
//             pc!.addTrack(track, callState.localStream!);
//           });
//         }
        
//         peerConnections.current.set(from, pc);
//       }
      
//       await pc.setRemoteDescription(offer);
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
      
//       console.log('Sending answer to:', from);
//       signalingService.send({
//         type: 'answer',
//         answer,
//         target: from
//       });
//     } catch (error) {
//       console.error('Error handling offer from', from, ':', error);
//     }
//   };
  
//   // Handle incoming answer
//   const handleAnswer = async (answer: RTCSessionDescriptionInit, from: string): Promise<void> => {
//     try {
//       const pc = peerConnections.current.get(from);
//       if (pc) {
//         await pc.setRemoteDescription(answer);
//         console.log('Set remote description (answer) for:', from);
//       } else {
//         console.error('No peer connection found for answer from:', from);
//       }
//     } catch (error) {
//       console.error('Error handling answer from', from, ':', error);
//     }
//   };
  
//   // Handle ICE candidate
//   const handleIceCandidate = async (candidate: RTCIceCandidate, from: string): Promise<void> => {
//     try {
//       const pc = peerConnections.current.get(from);
//       if (pc) {
//         await pc.addIceCandidate(candidate);
//         console.log('Added ICE candidate from:', from);
//       } else {
//         console.error('No peer connection found for ICE candidate from:', from);
//       }
//     } catch (error) {
//       console.error('Error handling ICE candidate from', from, ':', error);
//     }
//   };

//   // Handle peer leaving
//   const handlePeerLeft = (peerId: string): void => {
//     console.log('Cleaning up peer connection for:', peerId);
    
//     // Close peer connection
//     const pc = peerConnections.current.get(peerId);
//     if (pc) {
//       pc.close();
//       peerConnections.current.delete(peerId);
//     }

//     // Remove from state
//     setCallState(prev => {
//       const newRemoteStreams = new Map(prev.remoteStreams);
//       newRemoteStreams.delete(peerId);
      
//       return {
//         ...prev,
//         remoteStreams: newRemoteStreams,
//         connectedPeers: prev.connectedPeers.filter(peer => peer.id !== peerId)
//       };
//     });
//   };
  
//   // Toggle video
//   const toggleVideo = useCallback((): void => {
//     if (callState.localStream) {
//       const videoTrack = callState.localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setCallState(prev => ({ ...prev, isVideoOn: videoTrack.enabled }));
//       }
//     }
//   }, [callState.localStream]);
  
//   // Toggle audio
//   const toggleAudio = useCallback((): void => {
//     if (callState.localStream) {
//       const audioTrack = callState.localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setCallState(prev => ({ ...prev, isAudioOn: audioTrack.enabled }));
//       }
//     }
//   }, [callState.localStream]);
  
//   // Toggle screen share
//   const toggleScreenShare = useCallback(async (): Promise<void> => {
//     try {
//       if (!callState.isScreenSharing) {
//         // Start screen sharing
//         const screenStream = await getScreenShareStream();
//         screenShareStream.current = screenStream;
        
//         // Replace video track in all peer connections
//         const videoTrack = screenStream.getVideoTracks()[0];
//         peerConnections.current.forEach(async (pc) => {
//           const sender = pc.getSenders().find((s: RTCRtpSender) => 
//             s.track && s.track.kind === 'video'
//           );
//           if (sender) {
//             await sender.replaceTrack(videoTrack);
//           }
//         });
        
//         // Handle screen share end
//         videoTrack.onended = () => {
//           stopScreenShare();
//         };
        
//         setCallState(prev => ({ ...prev, isScreenSharing: true }));
//       } else {
//         stopScreenShare();
//       }
//     } catch (error) {
//       console.error('Error toggling screen share:', error);
//     }
//   }, [callState.isScreenSharing]);
  
//   // Stop screen share
//   const stopScreenShare = async (): Promise<void> => {
//     if (screenShareStream.current) {
//       screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
//       screenShareStream.current = null;
//     }
    
//     // Replace back to camera
//     if (callState.localStream) {
//       const videoTrack = callState.localStream.getVideoTracks()[0];
//       peerConnections.current.forEach(async (pc) => {
//         const sender = pc.getSenders().find((s: RTCRtpSender) => 
//           s.track && s.track.kind === 'video'
//         );
//         if (sender) {
//           await sender.replaceTrack(videoTrack);
//         }
//       });
//     }
    
//     setCallState(prev => ({ ...prev, isScreenSharing: false }));
//   };
  
//   // End call
//   const endCall = useCallback((): void => {
//     console.log('Ending call');
    
//     if (callState.localStream) {
//       callState.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
//     }
//     if (screenShareStream.current) {
//       screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
//     }
//     peerConnections.current.forEach((pc: RTCPeerConnection) => pc.close());
//     peerConnections.current.clear();
    
//     signalingService.disconnect();
//     setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
//   }, [callState.localStream]);
  
//   // Initialize media and join room
//   useEffect(() => {
//     const initializeCall = async (): Promise<void> => {
//       try {
//         console.log('Initializing call for room:', roomId);
        
//         // Generate a unique user ID
//         localUserId.current = 'user-' + Math.random().toString(36).substr(2, 9);
//         console.log('Local user ID:', localUserId.current);
        
//         // Connect to signaling server
//         console.log("[BASEURL]: ", BASEURL);
//         await signalingService.connect(BASEURL!);
        
//         // Wait a moment for connection
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // Get user media with better error handling
//         const stream = await getMediaStream({
//           video: true,
//           audio: true
//         });
        
//         console.log('Got local stream:', stream);
        
//         setCallState(prev => ({ 
//           ...prev, 
//           localStream: stream, 
//           callStatus: 'connected' 
//         }));
        
//         // Set up signaling message handler
//         signalingService.setMessageHandler(handleSignalingMessage);
        
//         // Join room through signaling
//         console.log('Joining room:', roomId);
//         signalingService.send({
//           type: 'join-room',
//           roomId,
//           peerId: localUserId.current
//         });
        
//       } catch (error) {
//         console.error('Failed to initialize call:', error);
//         setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
//       }
//     };
    
//     initializeCall();
    
//     return () => {
//       console.log('Cleaning up call');
//       // Cleanup on unmount
//       if (callState.localStream) {
//         callState.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
//       }
//       if (screenShareStream.current) {
//         screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
//       }
//       peerConnections.current.forEach((pc: RTCPeerConnection) => pc.close());
//       peerConnections.current.clear();
//       signalingService.disconnect();
//     };
//   }, [roomId, handleSignalingMessage]);
  
//   if (callState.callStatus === 'disconnected') {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
//         <div className="text-center">
//           <PhoneOff size={64} className="mx-auto mb-4 text-red-500" />
//           <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
//           <p className="text-gray-400">You have left the room: {roomId}</p>
//         </div>
//       </div>
//     );
//   }
  
//   if (!callState.roomConfirmation) {
//     return <RoomJoinConfirmation callState={callState} setCallState={setCallState} />
//   }
  
//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Header */}
//       <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//           <span className="font-medium">Room: {roomId}</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Users size={20} />
//           <span>{callState.connectedPeers.length + 1} participants</span>
//         </div>
//       </div>
      
//       {/* Video Grid */}
//       <div className="flex-1 p-6">
//         <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full max-h-[calc(100vh-200px)]">
//           {/* Local Video */}
//           <VideoTile
//             stream={callState.isScreenSharing ? screenShareStream.current : callState.localStream}
//             name="You"
//             isLocal={true}
//             isScreenShare={callState.isScreenSharing}
//           />
          
//           {/* Remote Videos */}
//           {Array.from(callState.remoteStreams.entries()).map(([peerId, stream]) => {
//             const peer = callState.connectedPeers.find((p: User) => p.id === peerId);
//             return (
//               <VideoTile 
//                 key={peerId}
//                 stream={stream}
//                 name={peer?.name || 'Unknown User'}
//                 isLocal={false}
//               />
//             );
//           })}
          
//           {/* Connected peer placeholders */}
//           {callState.connectedPeers
//             .filter((peer: User) => !callState.remoteStreams.has(peer.id))
//             .slice(0, 2)
//             .map((peer: User) => (
//               <VideoTile 
//                 key={peer.id}
//                 stream={null}
//                 name={peer.name}
//                 isLocal={false}
//               />
//             ))}
//         </div>
//       </div>
      
//       {/* Controls */}
//       <div className="bg-gray-800 px-6 py-4">
//         <div className="flex items-center justify-center space-x-4">
//           <ControlButton
//             icon={callState.isAudioOn ? Mic : MicOff}
//             active={callState.isAudioOn}
//             onClick={toggleAudio}
//           />
          
//           <ControlButton
//             icon={callState.isVideoOn ? Video : VideoOff}
//             active={callState.isVideoOn}
//             onClick={toggleVideo}
//           />
          
//           <ControlButton
//             icon={callState.isScreenSharing ? MonitorOff : Monitor}
//             active={callState.isScreenSharing}
//             onClick={toggleScreenShare}
//           />
          
//           <ControlButton
//             icon={PhoneOff}
//             active={false}
//             onClick={endCall}
//             className="bg-red-500 hover:bg-red-600 text-white"
//           />
//         </div>
//       </div>
      
//       {/* Connection Status */}
//       {callState.callStatus === 'connecting' && (
//         <div className="fixed top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg">
//           Connecting to room...
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoCallPage;

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, PhoneOff, Users } from 'lucide-react';
import VideoTile from './ui/video-tile';
import ControlButton from './ui/control-button';
import {
  SignalingMessage,
  CallState,
  User
} from '@/types/webrtc';
import { createPeerConnection, getMediaStream, getScreenShareStream } from '@/utils/webrtc';
import { SignalingService } from '@/utils/signaling';
import RoomJoinConfirmation from './room-join-confirmation';
import { BASEURL } from '@/utils/constants';

const signalingService = new SignalingService();

interface VideoCallPageProps {
  roomId?: string;
}

const VideoCallPage: React.FC<VideoCallPageProps> = ({ roomId = 'room-123' }) => {
  const [callState, setCallState] = useState<CallState>({
    localStream: null,
    remoteStreams: new Map(),
    peers: new Map(),
    isVideoOn: false,
    isAudioOn: false,
    isScreenSharing: false,
    connectedPeers: [],
    callStatus: 'waiting',
    roomConfirmation: false,
  });

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenShareStream = useRef<MediaStream | null>(null);
  const localUserId = useRef<string>('');

  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    switch (message.type) {
      case 'joined-room':
        if (message.roomInfo) {
          setCallState(prev => ({
            ...prev,
            connectedPeers: message.roomInfo!.participants.filter((p: User) => p.id !== localUserId.current),
            callStatus: 'connected',
            roomConfirmation: true
          }));

          const existingPeers = message.roomInfo.participants.filter((p: User) => p.id !== localUserId.current);
          for (const peer of existingPeers) {
            await createPeerConnectionForUser(peer.id, true);
          }
        }
        break;
      case 'peer-joined':
        if (message.peerId && message.data) {
          setCallState(prev => ({
            ...prev,
            connectedPeers: [...prev.connectedPeers, message.data!]
          }));
          await createPeerConnectionForUser(message.peerId, false);
        }
        break;
      case 'offer':
        if (message.offer && message.peerId) {
          await handleOffer(message.offer, message.peerId);
        }
        break;
      case 'answer':
        if (message.answer && message.peerId) {
          await handleAnswer(message.answer, message.peerId);
        }
        break;
      case 'ice-candidate':
        if (message.candidate && message.peerId) {
          await handleIceCandidate(message.candidate, message.peerId);
        }
        break;
      case 'peer-left':
        if (message.peerId) {
          handlePeerLeft(message.peerId);
        }
        break;
    }
  }, []);

  const createPeerConnectionForUser = async (peerId: string, shouldInitiateOffer: boolean = false): Promise<void> => {
    try {
      if (peerConnections.current.has(peerId)) return;

      const pc = createPeerConnection(
        (candidate: RTCIceCandidate) => {
          signalingService.send({ type: 'ice-candidate', candidate, target: peerId });
        },
        (stream: MediaStream) => {
          setCallState(prev => ({
            ...prev,
            remoteStreams: new Map(prev.remoteStreams.set(peerId, stream))
          }));
        }
      );

      if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => {
          pc.addTrack(track, callState.localStream!);
        });
      }

      peerConnections.current.set(peerId, pc);

      if (shouldInitiateOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        signalingService.send({ type: 'offer', offer, target: peerId });
      }
    } catch (error) {
      console.error('Error creating peer connection for', peerId, ':', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string): Promise<void> => {
    try {
      let pc = peerConnections.current.get(from);
      if (!pc) {
        pc = createPeerConnection(
          (candidate: RTCIceCandidate) => {
            signalingService.send({ type: 'ice-candidate', candidate, target: from });
          },
          (stream: MediaStream) => {
            setCallState(prev => ({
              ...prev,
              remoteStreams: new Map(prev.remoteStreams.set(from, stream))
            }));
          }
        );

        if (callState.localStream) {
          callState.localStream.getTracks().forEach(track => pc!.addTrack(track, callState.localStream!));
        }

        peerConnections.current.set(from, pc);
      }

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signalingService.send({ type: 'answer', answer, target: from });
    } catch (error) {
      console.error('Error handling offer from', from, ':', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, from: string): Promise<void> => {
    try {
      const pc = peerConnections.current.get(from);
      if (pc) await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer from', from, ':', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidate, from: string): Promise<void> => {
    try {
      const pc = peerConnections.current.get(from);
      if (pc) await pc.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate from', from, ':', error);
    }
  };

  const handlePeerLeft = (peerId: string): void => {
    const pc = peerConnections.current.get(peerId);
    if (pc) pc.close();
    peerConnections.current.delete(peerId);
    setCallState(prev => {
      const newRemoteStreams = new Map(prev.remoteStreams);
      newRemoteStreams.delete(peerId);
      return {
        ...prev,
        remoteStreams: newRemoteStreams,
        connectedPeers: prev.connectedPeers.filter(peer => peer.id !== peerId)
      };
    });
  };

  const toggleVideo = useCallback(() => {
    const videoTrack = callState.localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCallState(prev => ({ ...prev, isVideoOn: videoTrack.enabled }));
    }
  }, [callState.localStream]);

  const toggleAudio = useCallback(() => {
    const audioTrack = callState.localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setCallState(prev => ({ ...prev, isAudioOn: audioTrack.enabled }));
    }
  }, [callState.localStream]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenStream = await getScreenShareStream();
        screenShareStream.current = screenStream;
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnections.current.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(videoTrack);
        });
        videoTrack.onended = () => stopScreenShare();
        setCallState(prev => ({ ...prev, isScreenSharing: true }));
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [callState.isScreenSharing]);

  const stopScreenShare = async () => {
    screenShareStream.current?.getTracks().forEach(track => track.stop());
    screenShareStream.current = null;
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      peerConnections.current.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(videoTrack);
      });
    }
    setCallState(prev => ({ ...prev, isScreenSharing: false }));
  };

  const endCall = useCallback(() => {
    callState.localStream?.getTracks().forEach(track => track.stop());
    screenShareStream.current?.getTracks().forEach(track => track.stop());
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    signalingService.disconnect();
    setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
  }, [callState.localStream]);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        localUserId.current = 'user-' + Math.random().toString(36).substr(2, 9);
        await signalingService.connect(BASEURL!);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`${BASEURL}/meetings/${roomId}`);
        console.log(response);
        if (!response.ok) throw new Error('Invalid or expired room');

        const stream = await getMediaStream({ video: false, audio: true });
        stream.getVideoTracks().forEach(track => (track.enabled = false));
        stream.getAudioTracks().forEach(track => (track.enabled = false));

        setCallState(prev => ({
          ...prev,
          localStream: stream,
          callStatus: 'connected'
        }));

        signalingService.setMessageHandler(handleSignalingMessage);
        signalingService.send({ type: 'join-room', roomId, peerId: localUserId.current });

      } catch (error) {
        console.error('Failed to initialize call:', error);
        setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
      }
    };

    if (callState.roomConfirmation) {
      initializeCall();
    }

    return () => {
      callState.localStream?.getTracks().forEach(track => track.stop());
      screenShareStream.current?.getTracks().forEach(track => track.stop());
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      signalingService.disconnect();
    };
  }, [roomId, handleSignalingMessage]);

  if (callState.callStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <PhoneOff size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
          <p className="text-gray-400">You have left the room: {roomId}</p>
        </div>
      </div>
    );
  }

  if (!callState.roomConfirmation) {
    return <RoomJoinConfirmation callState={callState} setCallState={setCallState} />
  }

  return(
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-medium">Room: {roomId}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users size={20} />
          <span>{callState.connectedPeers.length + 1} participants</span>
        </div>
      </div>
      
      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full max-h-[calc(100vh-200px)]">
          {/* Local Video */}
          <VideoTile
            stream={callState.isScreenSharing ? screenShareStream.current : callState.localStream}
            name="You"
            isLocal={true}
            isScreenShare={callState.isScreenSharing}
          />
          
          {/* Remote Videos */}
          {Array.from(callState.remoteStreams.entries()).map(([peerId, stream]) => {
            const peer = callState.connectedPeers.find((p: User) => p.id === peerId);
            return (
              <VideoTile 
                key={peerId}
                stream={stream}
                name={peer?.name || 'Unknown User'}
                isLocal={false}
              />
            );
          })}
          
          {/* Connected peer placeholders */}
          {callState.connectedPeers
            .filter((peer: User) => !callState.remoteStreams.has(peer.id))
            .slice(0, 2)
            .map((peer: User) => (
              <VideoTile 
                key={peer.id}
                stream={null}
                name={peer.name}
                isLocal={false}
              />
            ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <ControlButton
            icon={callState.isAudioOn ? Mic : MicOff}
            active={callState.isAudioOn}
            onClick={toggleAudio}
          />
          
          <ControlButton
            icon={callState.isVideoOn ? Video : VideoOff}
            active={callState.isVideoOn}
            onClick={toggleVideo}
          />
          
          <ControlButton
            icon={callState.isScreenSharing ? MonitorOff : Monitor}
            active={callState.isScreenSharing}
            onClick={toggleScreenShare}
          />
          
          <ControlButton
            icon={PhoneOff}
            active={false}
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white"
          />
        </div>
      </div>
      
      {/* Connection Status */}
      {callState.callStatus === 'connecting' && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg">
          Connecting to room...
        </div>
      )}
    </div>
  )
};

export default VideoCallPage;
