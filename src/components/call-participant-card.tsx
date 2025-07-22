"use client";

import { OwnCapability, StreamVideoParticipant, useCall } from "@stream-io/video-react-sdk";
import { Ellipsis, Hand } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface ParticipantCardProps {
  participant: StreamVideoParticipant;
  mic?: boolean;
  cam?: boolean;
  raisedHand?: boolean;
}

const CallParticipant = ({ participant, raisedHand }: ParticipantCardProps) => {

  const call = useCall();

  const dropHand = async () => {
    if (!call || !call.isCreatedByMe) return;
    try {
      call.sendCustomEvent({
        type: "drop_hand",
        user: {
          name: participant?.name,
          userId: participant.userId
        }
      });
    } catch (error) {
      console.log("error raising hand", error);
    }
  }

  const handleMuteUser = async () => {
    if (!call || !call.isCreatedByMe) return;
    try {
      await call.updateUserPermissions({
        user_id: participant.userId,
        grant_permissions: [OwnCapability.SEND_AUDIO]
      });
    } catch (err) {
      toast.error("Failed to mute some participants. Please try again.");
      console.error(`Failed to mute ${participant.userId}:`, err);
    }
  };
  
  return (
    <div className="flex justify-between gap-5 px-1 py-2 hover:bg-gray-100 duration-200">
      <p className="text-sm font-semibold my-auto">{participant.name}</p>
      <div className="flex gap-2">
        <div className="flex">
          {raisedHand && (
            <span className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white">
              <Hand size={15} />
            </span>
          )}
        </div>

        {call?.isCreatedByMe && (<DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-full hover:bg-gray-300 h-6 w-6 flex justify-center items-center cursor-pointer duration-200">
              <Ellipsis size={15} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleMuteUser}>Unmute</DropdownMenuItem>
            {raisedHand && (<DropdownMenuItem onClick={dropHand}>Drop hand</DropdownMenuItem>)}
            {/* <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>)}
      </div>
    </div>
  )
}
export default CallParticipant;