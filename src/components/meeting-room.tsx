"use client";

import { cn } from "@/lib/utils";
import {
  // CallControls,
  CallingState,
  // CallParticipantsList,
  CallStatsButton,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
  OwnCapability,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  CancelCallConfirmButton,
  CancelCallButton,
  ScreenShareButton,
  RecordCallConfirmationButton,
  SpeakingWhileMutedNotification,
  ReactionsButton,
  CallParticipantsList,
  CustomVideoEvent
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { MicOff, UserPlus, Users, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
// import EndCallButton from "./ui/end-call-button";
import Loader from "./loader";
import { Meet } from "@/types/meeting";
// import { Input } from "./ui/input";
import { toast } from "sonner";
import { Button } from "./ui/button";
// import CallParticipant from "./call-participant-card";

const MeetingRoom = ({ meeting }: { meeting: Meet | null }) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [showControl, setShowControl] = useState<boolean>(false);

  const [receivedJoinRequest, setReceivedJoinRequest] = useState<boolean>(false);
  const [joinRequesters, setJoinRequesters] = useState<{name: string; id: string;}[]>([]);

  const { useCallCallingState, useLocalParticipant } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();

  // const participants = useParticipants();
  // const participantCount = useParticipantCount();

  const call = useCall();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      console.log("MEETING", meeting);
      location.assign("/");
    }
  }, [callingState]);
  
  useEffect(() => {
    if (call) {
      if (call.isCreatedByMe) {
        call.on("custom", (event: CustomVideoEvent) => {
          const payload = event.custom;

          if (payload.type === "join_request") {
            console.log("[PAYLOAD]: ", payload);
            setJoinRequesters((prev) => [...prev, payload.user]);
            setReceivedJoinRequest(true);
            console.log("REQUESTRES", joinRequesters);
          }
        })
      }
    }
  }, [call]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  // Recording toggle (admin only)
  // const handleRecording = async () => {
  //   if (!call) return;
  //   if (isRecording) await call.stopRecording();
  //   else await call.startRecording();
  // };

  const isMeetingOwner = localParticipant && call?.state.createdBy && localParticipant.userId === call.state.createdBy.id;

  const handleMuteAll = async () => {
    if (!call || !isMeetingOwner) return;

    const participants = call.state.participants.filter(
      (pert) => pert.userId !== call?.state.createdBy?.id
    );

    for (const participant of participants) {
      try {
        await call.updateUserPermissions({
          user_id: participant.userId,
          revoke_permissions: [OwnCapability.SEND_AUDIO]
        });
      } catch (err) {
        toast.error("Failed to mute some participants. Please try again.");
        console.error(`Failed to mute ${participant.userId}:`, err);
      }
    }
    toast.success("All participants have been muted.");
  };

  const acceptJoinRequests = async () => {
    if (!call || !isMeetingOwner) return;
    try {
      call.sendCustomEvent({
        type: "request_accepted",
        users: joinRequesters.map((req) => req.id),
      });
      setJoinRequesters([]);
      setReceivedJoinRequest(false);
    } catch (error) {
      toast.error("Error accepting join requests");
      console.error("Error accepting join requests:", error);
    }
  }

  const rejectJoinRequests = async () => {
    if (!call || !isMeetingOwner) return;
    try {
      call.sendCustomEvent({
        type: "request_rejected",
        users: joinRequesters.map((req) => req.id),
      });
      setJoinRequesters([]);
      setReceivedJoinRequest(false);
    } catch (error) {
      toast.error("Error accepting join requests");
      console.error("Error accepting join requests:", error);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <section className="relative h-full w-full overflow-hidden bg-[#0D1B2A] text-white px-3 md:px-5 py-5">
        {showControl && !showParticipants && <div className="flex md:justify-between items-center w-full flex-col md:flex-row justify-start gap-4 relative md:px-[100px]">
          {/* <div className="text-start w-[1100px]">
            <h1 className="text-2xl font-bold">{meeting?.title}</h1>
          </div> */}
          {/* <div className="my-auto w-full md:w-fit hidden md:flex flex-row items-start gap-2">
            <p className="font-bold my-auto">Meeting Link</p>
            <Input
              value={`${window.location.origin}/${meeting?.meetingId}`}
              disabled
              className="w-[300px]"
            />
          </div> */}

        </div>}
        <div className="relative flex items-center h-full justify-center">
          <div className={cn("flex size-full h-full justify-center items-center ", showControl ? "mb-22 max-w-[1000px]" : "mb-5 max-w-[1100px]", showParticipants && "mb-[550px] md:mb-5")}>
            <SpeakerLayout participantsBarPosition={null} />
          </div>  
          
        </div>

        {/* CONTROLS */}
        <div className={cn("fixed duration-200 ease-in-out flex w-full items-center justify-center gap-3 flex-wrap p-2 bg-[#0D1B2A]/60 backdrop-blur-sm z-40", showControl ? "translate-y-0 bottom-0" : "translate-y-full -bottom-10")}>
          {/* <CallControls /> */}
          <SpeakingWhileMutedNotification placement="top-end" >
            <ToggleAudioPublishingButton />
          </SpeakingWhileMutedNotification>
          <ToggleVideoPublishingButton />
          <ReactionsButton />

          {/* Admin-only buttons */}
          {!isPersonalRoom && isMeetingOwner && (
            <>
              {/* <button
                onClick={handleRecording}
                className="flex items-center gap-1 rounded bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
              >
                <Aperture size={18} />
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button> */}

              <ScreenShareButton />

              <RecordCallConfirmationButton />

              <CallStatsButton />

              <button
                onClick={handleMuteAll}
                className="rounded bg-white/10 p-2 hover:bg-white/20"
              >
                <MicOff size={18} />
              </button>

              <div className="h-fit w-fit relative">
                <button
                  onClick={() => setShowParticipants((prev) => !prev)}
                  className="rounded bg-white/10 p-2 hover:bg-white/20"
                >
                  <UserPlus size={20} />
                </button>
                {joinRequesters.length > 0 && (<div className="absolute h-5 w-5 justify-center items-center flex font-semibold rounded-full bg-red-500 text-xs text-white p-1 -top-2 -right-2">
                  {joinRequesters.length}
                </div>)}
              </div>
            </>
          )}

          {/* Participant toggle */}
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className="rounded bg-white/10 p-2 hover:bg-white/20"
          >
            <Users size={20} />
          </button>

          {!isPersonalRoom && isMeetingOwner ? (
            <CancelCallConfirmButton />
          ) : (
            <CancelCallButton />
          )}

          {/* End Call Button for participants */}
          {/* {!isPersonalRoom && <EndCallButton />} */}
        </div>
        
        <div className={cn("absolute duration-200 ease-in-out right-10 z-50", showControl ? "bottom-28" : "bottom-5")}>
          {showControl ? (
            <button
              onClick={() => setShowControl(false)}
              className="rounded bg-white/10 p-2 hover:bg-white/20"
            >
              <span className="text-sm">Hide Controls</span>
            </button>
          ) : (
            <button
              onClick={() => setShowControl(true)}
              className="rounded bg-white/10 p-2 hover:bg-white/20"
            >
              <span className="text-sm">Show Controls</span>
            </button>
          )}
        </div>
      </section>
      <div className="w-fit h-full overflow-hidden">
        {/* PARTICIPANT LIST */}
        {/* <div
          className={cn("text-[#0D1B2A] p-3 bg-white overflow-y-auto rounded-md absolute right-0 duration-300 ease-in-out w-full md:w-fit h-[500px]", showParticipants ? "bottom-28" : "bottom-[-100%]")}
        >
          <div className="py-2 px-4 flex gap-5">
            participants ({participantCount})
          </div>
          {participants.map((particip, i) => (
            <CallParticipant
              key={i}
              participant={particip}
            />
          ))}
        </div> */}
        {showParticipants && (
          <div className="p-3">
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        )}
      </div>

      {isMeetingOwner && receivedJoinRequest && (<div className="absolute bottom-5 right-5 border-2 border-border rounded-md p-4 bg-white w-[300px] flex flex-col gap-4">
        <div className="flex justify-between">
          <h3 className="font-bold">Join Requests</h3>
          <button>
            <X size={18} onClick={() => setReceivedJoinRequest(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
          </button>
        </div>
        <div>
          <p>{joinRequesters.length === 1 ? `${joinRequesters[0].name} is requesting to join` : `${joinRequesters[0].name} and ${joinRequesters.length - 1} others are requesting to join`}</p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={acceptJoinRequests}
          >
            <UserPlus size={18} className="mr-2" />
            {joinRequesters.length === 1 ? "Accept" : "Accept All"}
          </Button>
          <Button
            onClick={rejectJoinRequests}
            variant={"secondary"}
          >
            {joinRequesters.length === 1 ? "Reject" : "Reject All"}
          </Button>
        </div>
      </div>)}
    </div>
  );
};

export default MeetingRoom;
