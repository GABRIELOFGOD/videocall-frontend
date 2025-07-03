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

const signalingService = new SignalingService();

interface VideoCallPageProps {
  roomId?: string;
}

const VideoCallPage: React.FC<VideoCallPageProps> = ({ roomId = 'room-123' }) => {
  // State management with proper typing
  const [callState, setCallState] = useState<CallState>({
    localStream: null,
    remoteStreams: new Map(),
    peers: new Map(),
    isVideoOn: true,
    isAudioOn: true,
    isScreenSharing: false,
    connectedPeers: [],
    callStatus: 'connecting'
  });
  
  // Refs with proper typing
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenShareStream = useRef<MediaStream | null>(null);
  
  // Handle signaling messages
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    switch (message.type) {
      case 'peer-joined':
        if (message.peerId && message.data) {
          setCallState(prev => ({
            ...prev,
            connectedPeers: [...prev.connectedPeers, message.data!]
          }));
          await createPeerConnectionForUser(message.peerId);
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
  
  // Create peer connection for new user
  const createPeerConnectionForUser = async (peerId: string): Promise<void> => {
    const pc = createPeerConnection(
      (candidate: RTCIceCandidate) => {
        signalingService.send({
          type: 'ice-candidate',
          candidate,
          target: peerId
        });
      },
      (stream: MediaStream) => {
        setCallState(prev => ({
          ...prev,
          remoteStreams: new Map(prev.remoteStreams.set(peerId, stream))
        }));
      }
    );
    
    // Add local stream to peer connection
    if (callState.localStream) {
      callState.localStream.getTracks().forEach((track: MediaStreamTrack) => {
        pc.addTrack(track, callState.localStream!);
      });
    }
    
    peerConnections.current.set(peerId, pc);
    
    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    signalingService.send({
      type: 'offer',
      offer,
      target: peerId
    });
  };
  
  // Handle incoming offer
  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string): Promise<void> => {
    const pc = peerConnections.current.get(from);
    if (pc) {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      signalingService.send({
        type: 'answer',
        answer,
        target: from
      });
    }
  };
  
  // Handle incoming answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit, from: string): Promise<void> => {
    const pc = peerConnections.current.get(from);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  };
  
  // Handle ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidate, from: string): Promise<void> => {
    const pc = peerConnections.current.get(from);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  };

  // Handle peer leaving
  const handlePeerLeft = (peerId: string): void => {
    // Close peer connection
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerId);
    }

    // Remove from state
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
  
  // Toggle video
  const toggleVideo = useCallback((): void => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoOn: videoTrack.enabled }));
      }
    }
  }, [callState.localStream]);
  
  // Toggle audio
  const toggleAudio = useCallback((): void => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isAudioOn: audioTrack.enabled }));
      }
    }
  }, [callState.localStream]);
  
  // Toggle screen share
  const toggleScreenShare = useCallback(async (): Promise<void> => {
    try {
      if (!callState.isScreenSharing) {
        // Start screen sharing
        const screenStream = await getScreenShareStream();
        screenShareStream.current = screenStream;
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnections.current.forEach(async (pc) => {
          const sender = pc.getSenders().find((s: RTCRtpSender) => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });
        
        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };
        
        setCallState(prev => ({ ...prev, isScreenSharing: true }));
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [callState.isScreenSharing]);
  
  // Stop screen share
  const stopScreenShare = async (): Promise<void> => {
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      screenShareStream.current = null;
    }
    
    // Replace back to camera
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      peerConnections.current.forEach(async (pc) => {
        const sender = pc.getSenders().find((s: RTCRtpSender) => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      });
    }
    
    setCallState(prev => ({ ...prev, isScreenSharing: false }));
  };
  
  // End call
  const endCall = useCallback((): void => {
    if (callState.localStream) {
      callState.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    peerConnections.current.forEach((pc: RTCPeerConnection) => pc.close());
    
    signalingService.disconnect();
    setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
  }, [callState.localStream]);
  
  // Initialize media and join room
  useEffect(() => {
    const initializeCall = async (): Promise<void> => {
      try {
        // Connect to signaling server
        await signalingService.connect();
        
        // Wait a moment for connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const stream = await getMediaStream();
        setCallState(prev => ({ 
          ...prev, 
          localStream: stream, 
          callStatus: 'connected' 
        }));
        
        // Set up signaling message handler
        signalingService.setMessageHandler(handleSignalingMessage);
        
        // Join room through signaling
        signalingService.send({
          type: 'join-room',
          roomId,
          peerId: 'local-user'
        });
        
      } catch (error) {
        console.error('Failed to initialize call:', error);
        setCallState(prev => ({ ...prev, callStatus: 'disconnected' }));
      }
    };
    
    initializeCall();
    
    return () => {
      // Cleanup on unmount
      if (callState.localStream) {
        callState.localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      if (screenShareStream.current) {
        screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      peerConnections.current.forEach((pc: RTCPeerConnection) => pc.close());
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
  
  return (
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
  );
};

export default VideoCallPage;