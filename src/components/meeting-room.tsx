"use client";

import { cn } from "@/lib/utils";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import EndCallButton from "./ui/end-call-button";
import Loader from "./loader";
import { Meet } from "@/types/meeting";
import { Input } from "./ui/input";

// Hook to detect if user is on mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

const MeetingRoom = ({ meeting }: { meeting: Meet | null }) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [showControl, setShowControl] = useState<boolean>(false);
  const isMobile = useIsMobile();

  const { useCallCallingState, useLocalParticipant } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();

  const call = useCall();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      location.assign("/");
    }
  }, [callingState]);

  useEffect(() => {
    if (!isMobile) {
      setShowParticipants(true);
    } else {
      setShowParticipants(false);
    }
  }, [isMobile]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  // Recording toggle (admin only)
  // const handleRecording = async () => {
  //   if (!call) return;
  //   if (isRecording) await call.stopRecording();
  //   else await call.startRecording();
  // };

  const isMeetingOwner = localParticipant && call?.state.createdBy && localParticipant.userId === call.state.createdBy.id;

  // const handleMuteAll = async () => {
  //   if (!call) return;
  //   if (!isMeetingOwner) return;
  //   const otherParticipants = call.state.participants.filter(
  //     (participant) => participant.userId !== localParticipant.userId
  //   );
  //   otherParticipants.forEach((participant) => {
  //     // participant.audioStream?.addEventListener("removetrack", () => {
  //     //   participant.audioStream?.getTracks().forEach((track) => {
  //     //     track.enabled = false;
  //     //   });
  //     // });
  //     participant.audioStream?.getTracks().forEach((track) => {
  //       track.enabled = false;
  //     });
  //   });
  //   await call.sendCustomEvent({
  //     type: "mute-all",
  //     data: {},
  //   });
  // };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <section className="relative h-full w-full overflow-hidden bg-[#0D1B2A] text-white px-3 md:px-5 py-10">
        <div className="flex md:justify-between items-center w-full flex-col md:flex-row justify-start gap-4 relative">
          <div className="text-start w-full md:w-fit">
            <h1 className="text-2xl font-bold">{meeting?.title}</h1>
            <p className="font-medium text-xs text-gray-300">{meeting?.description}</p>
          </div>
          <div className="my-auto w-full md:w-fit hidden md:flex flex-col items-start gap-2">
            <p className="font-bold">Meeting Link</p>
            <Input
              value={`${window.location.origin}/${meeting?.meetingId}`}
              disabled
              className="w-[300px]"
            />
          </div>

        </div>
        <div className="relative flex items-center h-full justify-center">
          <div className="flex size-full h-full justify-center items-center max-w-[1100px]">
            <SpeakerLayout participantsBarPosition={null} />
          </div>  
          
        </div>

        {/* CONTROLS */}
        <div className={cn("fixed duration-200 ease-in-out flex w-full items-center justify-center gap-3 flex-wrap p-2 bg-[#0D1B2A]/60 backdrop-blur-sm z-40", showControl ? "translate-y-0 bottom-0" : "translate-y-full -bottom-10")}>
          <CallControls />

          {/* Admin-only buttons */}
          {!isPersonalRoom && isMeetingOwner && (
            <>
              {/* <button
                onClick={handleRecording}
                className="flex items-center gap-1 rounded bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
              >
                <Aperture size={18} />
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>

              <button
                onClick={handleMuteAll}
                className="flex items-center gap-1 rounded bg-yellow-500 px-3 py-2 text-sm hover:bg-yellow-600"
              >
                <MicOff size={18} />
                Mute All
              </button> */}

              <CallStatsButton />
            </>
          )}

          {/* Participant toggle */}
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className="rounded bg-white/10 p-2 hover:bg-white/20"
          >
            <Users size={20} />
          </button>

          {/* End Call Button for participants */}
          {!isPersonalRoom && <EndCallButton />}
        </div>
        
        <div className={cn("absolute duration-200 ease-in-out right-10 z-50", showControl ? "bottom-20" : "bottom-5")}>
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
      <div>
        {/* PARTICIPANT LIST */}
        {showParticipants && (
          <div
            className={cn("text-[#0D1B2A] p-3 h-screen bg-white overflow-y-auto rounded-md")}
          >
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;
