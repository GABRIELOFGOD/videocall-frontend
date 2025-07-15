import { StreamVideoParticipant } from "@stream-io/video-react-sdk";

const CallParticipant = ({ participant }: { participant: StreamVideoParticipant }) => {
  console.log("[PARTICIPANT]: ", participant);
  
  return (
    <div className="flex justify-between gap-5 px-1 py-2 cursor-pointer hover:bg-gray-200 duration-200">
      <p className="text-sm font-semibold my-auto">{participant.name}</p>
      
    </div>
  )
}
export default CallParticipant;