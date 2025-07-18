import { StreamVideoParticipant } from "@stream-io/video-react-sdk";
import { Hand } from "lucide-react";

export interface ParticipantCardProps {
  participant: StreamVideoParticipant;
  mic?: boolean;
  cam?: boolean;
  raisedHand?: boolean;
}

const CallParticipant = ({ participant, raisedHand }: ParticipantCardProps) => {
  
  return (
    <div className="flex justify-between gap-5 px-1 py-2 cursor-pointer hover:bg-gray-200 duration-200">
      <p className="text-sm font-semibold my-auto">{participant.name}</p>
      <div className="flex">
        {raisedHand && (
          <span className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white">
            <Hand size={15} />
          </span>
        )}
      </div>
    </div>
  )
}
export default CallParticipant;