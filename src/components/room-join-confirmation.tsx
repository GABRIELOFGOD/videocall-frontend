import { CallState } from '@/types/webrtc';
import { Video, VideoOff, Mic, MicOff, Users } from 'lucide-react';

export default function RoomJoinConfirmation({
  callState, setCallState
}: {
  callState: CallState,
  setCallState: React.Dispatch<React.SetStateAction<CallState>>
}) {

  const handleJoinRoom = async () => {
    setCallState({
      ...callState,
      roomConfirmation: true
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Join?</h2>
          <p className="text-gray-600">Configure your media settings before joining the room</p>
        </div>

        {/* Media Controls */}
        <div className="space-y-4 mb-8">
          {/* Video Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${callState.isVideoOn ? 'bg-green-100' : 'bg-red-100'}`}>
                {callState.isVideoOn ? (
                  <Video className="w-5 h-5 text-green-600" />
                ) : (
                  <VideoOff className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">Camera</p>
                <p className="text-sm text-gray-500">
                  {callState.isVideoOn ? 'Video is on' : 'Video is off'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCallState({...callState, isVideoOn: !callState.isVideoOn})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                callState.isVideoOn ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  callState.isVideoOn ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Mic Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${callState.isAudioOn ? 'bg-green-100' : 'bg-red-100'}`}>
                {callState.isAudioOn ? (
                  <Mic className="w-5 h-5 text-green-600" />
                ) : (
                  <MicOff className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">Microphone</p>
                <p className="text-sm text-gray-500">
                  {callState.isAudioOn ? 'Mic is on' : 'Mic is off'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCallState({ ...callState, isAudioOn: !callState.isAudioOn })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                callState.isAudioOn ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  callState.isAudioOn ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinRoom}
          disabled={callState.callStatus === "connecting"}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            callState.callStatus === "connecting"
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg'
          }`}
        >
          {callState.callStatus === "connecting" ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Joining...</span>
            </div>
          ) : (
            'Join Room'
          )}
        </button>

        {/* Info Text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          You can change these settings anytime during the call
        </p>
      </div>
    </div>
  );
}