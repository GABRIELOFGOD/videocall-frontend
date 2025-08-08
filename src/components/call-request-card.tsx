import { UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Call } from "@stream-io/video-react-sdk";
import { SetStateAction } from "react";

interface CallRequestCardProps {
  request: { name: string; id: string };
  call: Call | undefined;
  isMeetingOwner: boolean | undefined;
  setJoinRequesters: (value: SetStateAction<{
      name: string;
      id: string;
  }[]>) => void;
  setReceivedJoinRequest: (value: SetStateAction<boolean>) => void;
  joinRequesters: {
      name: string;
      id: string;
  }[];
}

const CallRequestCard = ({ request, call, isMeetingOwner, setJoinRequesters, setReceivedJoinRequest, joinRequesters }: CallRequestCardProps ) => {

  const acceptJoinRequest = async () => {
    if (!call || !isMeetingOwner) return;
    try {
      call.sendCustomEvent({
        type: "request_accepted",
        users: [ request.id]
      });
      setJoinRequesters((prev) => prev.filter((req) => req.id !== request.id));
      setReceivedJoinRequest(joinRequesters.length > 0);
    } catch (error) {
      console.error("Error accepting join requests:", error);
    }
  };

  const rejectJoinRequest = async () => {
    if (!call || !isMeetingOwner) return;
    try {
      call.sendCustomEvent({
        type: "request_rejected",
        users: [ request.id]
      });
      setJoinRequesters([]);
      setReceivedJoinRequest(false);
    } catch (error) {
      console.error("Error accepting join requests:", error);
    }
  };
  
  return (
    <div className="flex justify-between gap-5 px-1 py-2 hover:bg-gray-100 duration-200">
      <p className="text-sm font-semibold my-auto">{request.name}</p>
      <div className="flex gap-4">
        <Button onClick={acceptJoinRequest}>
          <UserPlus size={18} className="mr-2" />
          Accept
        </Button>
        <Button onClick={rejectJoinRequest} variant={"secondary"}>
          Reject
        </Button>
      </div>
    </div>
  )
}
export default CallRequestCard;