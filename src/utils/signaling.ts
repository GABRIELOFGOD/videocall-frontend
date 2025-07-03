// import { Room, SignalingMessage, User } from '@/types/webrtc';
// import { Socket } from 'socket.io-client';
// import { BASEURL } from './constants';

// export class SignalingService {
//   private socket: Socket | null = null;
//   private messageHandler: ((message: SignalingMessage) => void) | null = null;

//   async connect(serverUrl: string = BASEURL!): Promise<void> {
//     if (typeof window !== 'undefined' && !this.socket) {
//       const { io } = await import('socket.io-client');
      
//       this.socket = io(serverUrl, {
//         autoConnect: true,
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//       });
      
//       this.socket.on('connect', () => {
//         console.log('Connected to signaling server');
//       });
      
//       this.socket.on('disconnect', () => {
//         console.log('Disconnected from signaling server');
//       });
      
//       this.socket.on('error', (error: Error) => {
//         console.error('Socket error:', error);
//       });
      
//       this.setupEventHandlers();
//     }
//   }

//   private setupEventHandlers(): void {
//     if (!this.socket) return;

//     this.socket.on('peer-joined', (data: { peerId: string; user: User }) => {
//       this.messageHandler?.({ type: 'peer-joined', peerId: data.peerId, data: data.user });
//     });
    
//     this.socket.on('offer', (data: { offer: RTCSessionDescriptionInit; from: string }) => {
//       this.messageHandler?.({ type: 'offer', offer: data.offer, peerId: data.from });
//     });
    
//     this.socket.on('answer', (data: { answer: RTCSessionDescriptionInit; from: string }) => {
//       this.messageHandler?.({ type: 'answer', answer: data.answer, peerId: data.from });
//     });
    
//     this.socket.on('ice-candidate', (data: { candidate: RTCIceCandidate; from: string }) => {
//       this.messageHandler?.({ type: 'ice-candidate', candidate: data.candidate, peerId: data.from });
//     });
    
//     this.socket.on('peer-left', (data: { peerId: string }) => {
//       this.messageHandler?.({ type: 'peer-left', peerId: data.peerId });
//     });
    
//     this.socket.on('joined-room', (data: Room) => {
//       this.messageHandler?.({ type: 'joined-room', roomInfo: data });
//     });
//   }
  
//   send(message: SignalingMessage): void {
//     if (!this.socket?.connected) return;

//     switch (message.type) {
//       case 'join-room':
//         this.socket.emit('join-room', {
//           roomId: message.roomId,
//           userInfo: {
//             name: 'User-' + Math.random().toString(36).substr(2, 5),
//             avatar: '👤'
//           }
//         });
//         break;
//       case 'offer':
//         this.socket.emit('offer', { target: message.target, offer: message.offer });
//         break;
//       case 'answer':
//         this.socket.emit('answer', { target: message.target, answer: message.answer });
//         break;
//       case 'ice-candidate':
//         this.socket.emit('ice-candidate', { target: message.target, candidate: message.candidate });
//         break;
//     }
//   }
  
//   setMessageHandler(handler: (message: SignalingMessage) => void): void {
//     this.messageHandler = handler;
//   }
  
//   disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }
// }

// @/utils/signaling.ts

import { Room, SignalingMessage, User } from '@/types/webrtc';
import { Socket } from 'socket.io-client';
import { BASEURL } from './constants';

export class SignalingService {
  private socket: Socket | null = null;
  private messageHandler: ((message: SignalingMessage) => void) | null = null;

  async connect(serverUrl: string = BASEURL!): Promise<void> {
    if (typeof window !== 'undefined' && !this.socket) {
      const { io } = await import('socket.io-client');
      
      this.socket = io(serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to signaling server, socket ID:', this.socket?.id);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from signaling server:', reason);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
      
      this.socket.on('error', (error: Error) => {
        console.error('Socket error:', error);
      });
      
      this.setupEventHandlers();
    }
  }
  send(message: SignalingMessage): void {
    if (!this.socket?.connected) return;

    switch (message.type) {
      case 'join-room':
        this.socket.emit('join-room', {
          roomId: message.roomId,
          userInfo: {
            name: 'User-' + Math.random().toString(36).substr(2, 5),
            avatar: '👤'
          }
        });
        break;
      case 'offer':
        this.socket.emit('offer', { target: message.target, offer: message.offer });
        break;
      case 'answer':
        this.socket.emit('answer', { target: message.target, answer: message.answer });
        break;
      case 'ice-candidate':
        this.socket.emit('ice-candidate', { target: message.target, candidate: message.candidate });
        break;
    }
  }
  
  setMessageHandler(handler: (message: SignalingMessage) => void): void {
    this.messageHandler = handler;
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Handle successful room join
    this.socket.on('joined-room', (data: Room) => {
      console.log('Joined room event received:', data);
      this.messageHandler?.({ type: 'joined-room', roomInfo: data });
    });

    // Handle new peer joining
    this.socket.on('peer-joined', (data: { peerId: string; user: User }) => {
      console.log('Peer joined event received:', data);
      this.messageHandler?.({ type: 'peer-joined', peerId: data.peerId, data: data.user });
    });
    
    // Handle WebRTC offer
    this.socket.on('offer', (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Offer received from:', data.from);
      this.messageHandler?.({ type: 'offer', offer: data.offer, peerId: data.from });
    });

    this.socket.on('answer', (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      this.messageHandler?.({ type: 'answer', answer: data.answer, peerId: data.from });
    });
    
    this.socket.on('ice-candidate', (data: { candidate: RTCIceCandidate; from: string }) => {
      this.messageHandler?.({ type: 'ice-candidate', candidate: data.candidate, peerId: data.from });
    });
    
    this.socket.on('peer-left', (data: { peerId: string }) => {
      this.messageHandler?.({ type: 'peer-left', peerId: data.peerId });
    });
    
    this.socket.on('joined-room', (data: Room) => {
      this.messageHandler?.({ type: 'joined-room', roomInfo: data });
    });
  }
}
    
    // Handle WebRTC answer
    // this.socket.on('answer', (data: { answer: RTCSessionDescriptionInit; from: string }) => {
    //   console.log('Answer received from:', data.from);
    //   this.messageHandler?.({ type: 'answer', answer: data.answer, peerId: data.from });
    // });
    
    // // Handle ICE candidate
    // this.socket.on('ice-candidate', (data: { candidate: RTCIceCandidate; from: