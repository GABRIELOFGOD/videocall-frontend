"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff, 
  PhoneOff, 
  Users, 
  Hand,
  Settings,
  MessageSquare,
  MoreVertical,
  Info
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { BASEURL } from '@/utils/constants';

// Types
interface User {
  id: string;
  name: string;
  peerId: string;
  raisedHand?: boolean;
  isVideoOn?: boolean;
  isAudioOn?: boolean;
}

interface CallState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peers: Map<string, RTCPeerConnection>;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  connectedPeers: User[];
  callStatus: 'waiting' | 'connecting' | 'connected' | 'disconnected';
  roomConfirmation: boolean;
  activeSpeaker: string | null;
  username?: string;
}

// Components
const VideoTile: React.FC<{
  stream: MediaStream | null;
  name: string;
  isLocal: boolean;
  isScreenShare?: boolean;
  isVideoOn?: boolean;
  isAudioOn?: boolean;
  raisedHand?: boolean;
  isActiveSpeaker?: boolean;
}> = ({ stream, name, isLocal, isScreenShare, isVideoOn, isAudioOn, raisedHand, isActiveSpeaker }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${isActiveSpeaker ? 'ring-2 ring-blue-500' : ''}`}>
      {stream && (isVideoOn || isScreenShare) ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
            </div>
            <p className="text-white text-sm">{name}</p>
          </div>
        </div>
      )}
      
      {/* Overlay with user info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate">{name}</span>
          <div className="flex items-center space-x-1">
            {raisedHand && <Hand size={16} className="text-yellow-400" />}
            {!isAudioOn && <MicOff size={16} className="text-red-400" />}
            {!isVideoOn && <VideoOff size={16} className="text-red-400" />}
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  className?: string;
  label?: string;
}> = ({ icon: Icon, active, onClick, className = "", label }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition-all duration-200 ${
        active 
          ? 'bg-white text-gray-900 hover:bg-gray-100' 
          : 'bg-gray-600 text-white hover:bg-gray-500'
      } ${className}`}
      title={label}
    >
      <Icon size={20} />
    </button>
  );
};

const RoomJoinConfirmation: React.FC<{
  callState: CallState;
  setCallState: React.Dispatch<React.SetStateAction<CallState>>;
  roomId: string;
  originalStreamRef: React.MutableRefObject<MediaStream | null>;
}> = ({ callState, setCallState, roomId, originalStreamRef }) => {
  const [userName, setUserName] = useState('');
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log(callState);
    const getPreviewStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setPreviewStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getPreviewStream();

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const togglePreviewVideo = () => {
    if (previewStream) {
      const videoTrack = previewStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const togglePreviewAudio = () => {
    if (previewStream) {
      const audioTrack = previewStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  // const joinRoom = () => {
  //   if (!userName.trim()) return;
    
  //   setCallState(prev => ({
  //     ...prev,
  //     roomConfirmation: true,
  //     localStream: previewStream,
  //     isVideoOn,
  //     isAudioOn,
  //     username: userName
  //   }));
  // };

  const joinRoom = () => {
    if (!userName.trim()) return;
    
    // **FIX: Store the original stream reference**
    if (previewStream) {
      originalStreamRef.current = previewStream;
    }
    
    setCallState(prev => ({
      ...prev,
      roomConfirmation: true,
      localStream: previewStream,
      isVideoOn,
      isAudioOn,
      username: userName
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Room</h2>
        
        {/* Video Preview */}
        <div className="relative bg-gray-700 rounded-lg overflow-hidden mb-6 aspect-video">
          {previewStream && isVideoOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-white">
                    {userName.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <p className="text-white text-sm">Camera is off</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <ControlButton
            icon={isVideoOn ? Video : VideoOff}
            active={isVideoOn}
            onClick={togglePreviewVideo}
            label="Toggle Camera"
          />
          <ControlButton
            icon={isAudioOn ? Mic : MicOff}
            active={isAudioOn}
            onClick={togglePreviewAudio}
            label="Toggle Microphone"
          />
        </div>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full p-3 bg-gray-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Room Info */}
        <div className="text-gray-400 text-sm mb-6 text-center">
          Room ID: <span className="text-white font-mono">{roomId}</span>
        </div>

        {/* Join Button */}
        <button
          onClick={joinRoom}
          disabled={!userName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

// Main Component
const VideoCallPage: React.FC<{ roomId?: string }> = ({ roomId = 'room-123' }) => {
  const [callState, setCallState] = useState<CallState>({
    localStream: null,
    remoteStreams: new Map(),
    peers: new Map(),
    isVideoOn: false,
    isAudioOn: false,
    isScreenSharing: false,
    isHandRaised: false,
    connectedPeers: [],
    callStatus: 'waiting',
    roomConfirmation: false,
    activeSpeaker: null
  });

  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenShareStream = useRef<MediaStream | null>(null);
  const localUserId = useRef<string>('');

  const originalStreamRef = useRef<MediaStream | null>(null);
  const audioOnlyStreamRef = useRef<MediaStream | null>(null);

  // WebRTC configuration
  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  function createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(pcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log(`Sending ICE candidate to ${peerId}`);
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          target: peerId
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received track:', event.track.kind, 'enabled:', event.track.enabled);
      const stream = event.streams[0];
      if (stream) {
        // **FIX: Create a new MediaStream to avoid reference issues**
        const newStream = new MediaStream();
        stream.getTracks().forEach(track => {
          newStream.addTrack(track);
          // Ensure audio tracks are always enabled when received
          if (track.kind === 'audio') {
            track.enabled = true;
          }
        });
        
        setCallState(prev => {
          const updated = new Map(prev.remoteStreams);
          updated.set(peerId, newStream);
          return {
            ...prev,
            remoteStreams: updated
          };
        });
      }
    };

    // **FIX: Add connection state monitoring**
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${peerId}: ${pc.connectionState}`);
      if (pc.connectionState === 'failed') {
        // Attempt to restart ICE
        pc.restartIce();
      }
    };

    return pc;
  }

  const createOffer = useCallback(async (peerId: string) => {
    try {
      const pc = createPeerConnection(peerId);
      peerConnections.current.set(peerId, pc);

      if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => {
          pc.addTrack(track, callState.localStream!);
        });
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('offer', { offer, target: peerId });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }, [callState.localStream]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, peerId: string) => {
    try {
      const pc = createPeerConnection(peerId);
      peerConnections.current.set(peerId, pc);

      if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => {
          pc.addTrack(track, callState.localStream!);
        });
      }

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.emit('answer', { answer, target: peerId });
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  }, [callState.localStream]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit, peerId: string) => {
    try {
      console.log(`Handling answer from ${peerId}`);
      const pc = peerConnections.current.get(peerId);
      if (pc) {
        await pc.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate, peerId: string) => {
    try {
      console.log(`Handling ICE candidate from ${peerId}`);
      const pc = peerConnections.current.get(peerId);
      if (pc) {
        await pc.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (!callState.localStream) return;

    try {
      const newVideoState = !callState.isVideoOn;
      
      if (newVideoState) {
        // **FIX: Turning video ON - use original stream with video**
        if (originalStreamRef.current) {
          const videoTrack = originalStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = true;
            
            // Replace tracks in all peer connections
            peerConnections.current.forEach(async (pc) => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video');
              if (sender) {
                await sender.replaceTrack(videoTrack);
              }
            });
            
            setCallState(prev => ({ 
              ...prev, 
              isVideoOn: true,
              localStream: originalStreamRef.current 
            }));
          }
        }
      } else {
        // **FIX: Turning video OFF - create audio-only stream**
        if (!audioOnlyStreamRef.current) {
          const audioTrack = callState.localStream.getAudioTracks()[0];
          if (audioTrack) {
            audioOnlyStreamRef.current = new MediaStream([audioTrack.clone()]);
          }
        }
        
        if (audioOnlyStreamRef.current) {
          // Replace video track with null (remove video)
          peerConnections.current.forEach(async (pc) => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
              await sender.replaceTrack(null);
            }
          });
          
          setCallState(prev => ({ 
            ...prev, 
            isVideoOn: false,
            localStream: audioOnlyStreamRef.current 
          }));
        }
      }
      
      // Emit state change
      socketRef.current?.emit('media-state-change', {
        roomId,
        isVideoOn: newVideoState,
        isAudioOn: callState.isAudioOn
      });
      
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }, [callState.localStream, callState.isVideoOn, callState.isAudioOn, roomId]);

  const toggleAudio = useCallback(() => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newAudioState = audioTrack.enabled;
        
        // **FIX: Get current video state from the actual track**
        const videoTrack = callState.localStream.getVideoTracks()[0];
        const currentVideoState = videoTrack ? videoTrack.enabled : false;
        
        setCallState(prev => ({ ...prev, isAudioOn: newAudioState }));
        
        socketRef.current?.emit('media-state-change', {
          roomId,
          isVideoOn: currentVideoState, // Use actual track state
          isAudioOn: newAudioState
        });
      }
    }
  }, [callState.localStream, roomId]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        screenShareStream.current = screenStream;
        
        const videoTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track for all peer connections
        peerConnections.current.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });
        
        videoTrack.onended = () => {
          setCallState(prev => ({ ...prev, isScreenSharing: false }));
          // Restore original video track
          if (callState.localStream) {
            const originalVideoTrack = callState.localStream.getVideoTracks()[0];
            peerConnections.current.forEach(async (pc) => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video');
              if (sender) {
                await sender.replaceTrack(originalVideoTrack);
              }
            });
          }
          socketRef.current?.emit('screen-share-stop', { roomId });
        };
        
        setCallState(prev => ({ ...prev, isScreenSharing: true }));
        socketRef.current?.emit('screen-share-start', { roomId });
      } else {
        screenShareStream.current?.getTracks().forEach(track => track.stop());
        screenShareStream.current = null;
        
        // Restore original video track
        if (callState.localStream) {
          const videoTrack = callState.localStream.getVideoTracks()[0];
          peerConnections.current.forEach(async (pc) => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
              await sender.replaceTrack(videoTrack);
            }
          });
        }
        
        setCallState(prev => ({ ...prev, isScreenSharing: false }));
        socketRef.current?.emit('screen-share-stop', { roomId });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [callState.isScreenSharing, callState.localStream, roomId]);

  const toggleHandRaise = useCallback(() => {
    const newState = !callState.isHandRaised;
    setCallState(prev => ({ ...prev, isHandRaised: newState }));
    socketRef.current?.emit('raise-hand', { roomId });
  }, [callState.isHandRaised, roomId]);

  const endCall = useCallback(() => {
    callState.localStream?.getTracks().forEach(track => track.stop());
    originalStreamRef.current?.getTracks().forEach(track => track.stop());
    audioOnlyStreamRef.current?.getTracks().forEach(track => track.stop());
    screenShareStream.current?.getTracks().forEach(track => track.stop());
    
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    socketRef.current?.disconnect();
    
    // Reset refs
    originalStreamRef.current = null;
    audioOnlyStreamRef.current = null;
    
    setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
  }, [callState.localStream]);

  useEffect(() => {
    if (!callState.roomConfirmation) return;

    const initializeSocket = async () => {
      try {
        // Check if room exists
        const response = await fetch(`${BASEURL}/api/meetings/${roomId}`);
        if (!response.ok) {
          throw new Error('Failed to verify room');
        }

        localUserId.current = 'user-' + Math.random().toString(36).substr(2, 9);
        
        // Initialize socket connection
        socketRef.current = io(BASEURL);
        
        socketRef.current.on('connect', () => {
          console.log('Connected to server');
          setCallState(prev => ({ ...prev, callStatus: 'connected' }));
          
          // Join room
          socketRef.current?.emit('join-room', {
            roomId,
            name: callState.username || "User",
            peerId: localUserId.current,
            isVideoOn: callState.isVideoOn,
            isAudioOn: callState.isAudioOn  
          });
        });

        socketRef.current.on('joined-room', (data) => {
          console.log('Joined room:', data);
          setCallState(prev => ({
            ...prev,
            connectedPeers: data.roomInfo.participants.filter((p: User) => p.id !== localUserId.current)
          }));
        });

        socketRef.current.on('peer-joined', (data) => {
          console.log('Peer joined:', data);
          setCallState(prev => ({
            ...prev,
            connectedPeers: [...prev.connectedPeers, data.data]
          }));
          // Small delay to ensure state is updated
          setTimeout(() => {
            createOffer(data.peerId);
          }, 100);
        });

        socketRef.current.on('offer', (data) => {
          handleOffer(data.offer, data.peerId);
        });

        socketRef.current.on('answer', (data) => {
          handleAnswer(data.answer, data.peerId);
        });

        socketRef.current.on('ice-candidate', (data) => {
          handleIceCandidate(data.candidate, data.peerId);
        });

        socketRef.current.on('peer-left', (data) => {
          console.log('Peer left:', data.peerId);
          const pc = peerConnections.current.get(data.peerId);
          if (pc) {
            pc.close();
            peerConnections.current.delete(data.peerId);
          }
          
          setCallState(prev => ({
            ...prev,
            connectedPeers: prev.connectedPeers.filter(peer => peer.id !== data.peerId),
            remoteStreams: new Map(Array.from(prev.remoteStreams.entries()).filter(([id]) => id !== data.peerId))
          }));
        });

        socketRef.current.on('volume-update', (data) => {
          setCallState(prev => ({
            ...prev,
            activeSpeaker: data.level > 0.1 ? data.id : null
          }));
        });

        socketRef.current.on('hand-raised', (data) => {
          setCallState(prev => ({
            ...prev,
            connectedPeers: prev.connectedPeers.map(peer => 
              peer.id === data.peerId 
                ? { ...peer, raisedHand: data.raisedHand }
                : peer
            )
          }));
        });

        socketRef.current.on('peer-media-state', (data) => {
          setCallState(prev => ({
            ...prev,
            connectedPeers: prev.connectedPeers.map(peer => 
              peer.id === data.peerId 
                ? { ...peer, isVideoOn: data.isVideoOn, isAudioOn: data.isAudioOn }
                : peer
            )
          }));
        });

      } catch (error) {
        console.error('Failed to initialize call:', error);
        setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
      }
    };

    initializeSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [callState.roomConfirmation, roomId, createOffer, handleOffer, handleAnswer, handleIceCandidate]);

  // Volume detection for active speaker
  useEffect(() => {
    if (callState.localStream && callState.isAudioOn) {
      const interval = setInterval(() => {
        const level = Math.random(); // Simulate volume level - replace with actual audio analysis
        socketRef.current?.emit('volume-level', { roomId, level });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [callState.localStream, callState.isAudioOn, roomId]);

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
    return <RoomJoinConfirmation callState={callState} setCallState={setCallState} roomId={roomId} originalStreamRef={originalStreamRef} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-medium">Room: {roomId}</span>
          <div className="flex items-center space-x-1 text-gray-400">
            <Info size={16} />
            <span className="text-sm">Secured with end-to-end encryption</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users size={20} />
            <span>{callState.connectedPeers.length + 1}</span>
          </div>
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <Settings size={20} />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Video Grid */}
      <div className="flex-1 flex md:flex-row flex-col h-[80vh] overflow-hidden">
        {/* Main Speaker Area */}
        <div className="md:flex-[3] flex-1 p-4">
          {(() => {
            const activeId = callState.activeSpeaker;
            const isLocalSpeaker = activeId === localUserId.current;
            
            // If no active speaker, show local stream as main
            const mainStream = isLocalSpeaker || !activeId
              ? (callState.isScreenSharing ? screenShareStream.current : callState.localStream)
              : callState.remoteStreams.get(activeId);

            const mainUser = isLocalSpeaker || !activeId
              ? {
                  name: "You",
                  isLocal: true,
                  isVideoOn: callState.isVideoOn,
                  isAudioOn: callState.isAudioOn,
                  raisedHand: callState.isHandRaised,
                }
              : callState.connectedPeers.find((p) => p.id === activeId);

            return (
              <div className="w-full h-full">
                <VideoTile
                  stream={mainStream ?? null}
                  name={mainUser?.name || "Unknown"}
                  isLocal={mainUser && 'isLocal' in mainUser ? mainUser.isLocal : false}
                  isVideoOn={mainUser?.isVideoOn}
                  isAudioOn={mainUser?.isAudioOn}
                  raisedHand={mainUser?.raisedHand}
                  isActiveSpeaker={true}
                />
              </div>
            );
          })()}
        </div>

        {/* Participant Strip */}
        {(callState.connectedPeers.length > 0 || (callState.activeSpeaker && callState.activeSpeaker !== localUserId.current)) && (
          <div className="bg-gray-800 p-4 border-t flex-1 border-gray-700">
            <div className="flex space-x-3 overflow-x-auto">
              {/* Local tile (if not main speaker) */}
              {callState.activeSpeaker && callState.activeSpeaker !== localUserId.current && (
                <div className="flex-shrink-0 w-32 h-24">
                  <VideoTile
                    stream={callState.isScreenSharing ? screenShareStream.current : callState.localStream}
                    name="You"
                    isLocal={true}
                    isScreenShare={callState.isScreenSharing}
                    isVideoOn={callState.isVideoOn}
                    isAudioOn={callState.isAudioOn}
                    raisedHand={callState.isHandRaised}
                    isActiveSpeaker={false}
                  />
                </div>
              )}

              {/* Remote participants (excluding active speaker) */}
              {callState.connectedPeers
                .filter(peer => peer.id !== callState.activeSpeaker)
                .map((peer) => {
                  const stream = callState.remoteStreams.get(peer.id);
                  return (
                    <div key={peer.id} className="flex-shrink-0 w-32 h-24">
                      <VideoTile
                        stream={stream || null}
                        name={peer.name}
                        isLocal={false}
                        isVideoOn={peer.isVideoOn}
                        isAudioOn={peer.isAudioOn}
                        raisedHand={peer.raisedHand}
                        isActiveSpeaker={false}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <ControlButton
              icon={callState.isAudioOn ? Mic : MicOff}
              active={callState.isAudioOn}
              onClick={toggleAudio}
              label="Toggle Microphone"
            />
            
            <ControlButton
              icon={callState.isVideoOn ? Video : VideoOff}
              active={callState.isVideoOn}
              onClick={toggleVideo}
              label="Toggle Camera"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <ControlButton
              icon={callState.isScreenSharing ? MonitorOff : Monitor}
              active={callState.isScreenSharing}
              onClick={toggleScreenShare}
              label="Share Screen"
            />
            
            <ControlButton
              icon={Hand}
              active={callState.isHandRaised}
              onClick={toggleHandRaise}
              label="Raise Hand"
              className={callState.isHandRaised ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <ControlButton
              icon={MessageSquare}
              active={false}
              onClick={() => console.log('Chat clicked')}
              label="Chat"
            />
            
            <ControlButton
              icon={PhoneOff}
              active={false}
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white"
              label="Leave Call"
            />
          </div>
        </div>
      </div>
      
      {/* Connection Status */}
      {callState.callStatus === 'connecting' && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Connecting to room...</span>
          </div>
        </div>
      )}
      
      {/* Active Speaker Indicator */}
      {callState.activeSpeaker && (
        <div className="fixed top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
          🎤 {callState.connectedPeers.find(p => p.id === callState.activeSpeaker)?.name || 'Someone'} is speaking
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;