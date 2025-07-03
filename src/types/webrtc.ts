// types/webrtc.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  joinedAt?: Date;
  mediaState?: MediaState;
}

export interface MediaState {
  video: boolean;
  audio: boolean;
}

export interface Room {
  id: string;
  participants: User[];
  createdAt: Date;
  participantCount: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: User;
  timestamp: Date;
}

export interface SignalingMessage {
  type: 'join-room' | 'offer' | 'answer' | 'ice-candidate' | 'peer-joined' | 'peer-left' | 'joined-room';
  roomId?: string;
  peerId?: string;
  target?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidate;
  data?: User;
  roomInfo?: Room;
}

export interface CallState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peers: Map<string, RTCPeerConnection>;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  connectedPeers: User[];
  callStatus: 'connecting' | 'connected' | 'disconnected';
  roomConfirmation?: boolean;
}
