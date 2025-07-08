// "use client";

// import { cn } from "@/lib/utils";
// import {
//   CallControls,
//   CallingState,
//   CallParticipantsList,
//   CallStatsButton,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
// } from "@stream-io/video-react-sdk";
// import { useEffect, useState } from "react";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { LayoutList, Users } from "lucide-react";
// import { useSearchParams } from "next/navigation";
// import EndCallButton from "./ui/end-call-button";
// import Loader from "./loader";

// export type CallLayoutType = "speaker-left" | "speaker-right" | "grid";

// const MeetingRoom = () => {
//   const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
//   const [showParticipants, setShowParticipants] = useState<boolean>(false);
//   const searchParams = useSearchParams();
//   const isPersonalRoom = !!searchParams.get("personal");

//   const { useCallCallingState } = useCallStateHooks();

//   const callingState = useCallCallingState();

//   useEffect(() => {
//     if (callingState === CallingState.LEFT) {
//       location.assign("/")
//     }
//   }, [callingState]);

//   if (callingState !== CallingState.JOINED) return <Loader />

//   const CallLayout = () => {
//     switch (layout) {
//       case "grid":
//         return <PaginatedGridLayout />;
//       case "speaker-left":
//         return <SpeakerLayout participantsBarPosition="right" />;
//       case "speaker-right":
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden p-4 text-white">
//       <div className="relative flex size-full items-center justify-center">
//         <div className="flex size-full items-center max-w-[1400px]">
//           <CallLayout />
//         </div>
//         <div
//           className={cn("h-[calc(100vh-86px)] hidden ml-2 bg-black px-2 py-4", {
//             "block": showParticipants,
//           })}
//         >
//           <CallParticipantsList onClose={() => setShowParticipants(false)} />
//         </div>
//       </div>

//       <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
//         <CallControls

//         />

//         <DropdownMenu>
//           <div className="flex items-center">
//             <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-accent-foreground/70 text-accent px-4 py-2 hover:bg-accent-foreground/50 duration-200 ">
//               <LayoutList size={20} />
//             </DropdownMenuTrigger>
//           </div>

//           <DropdownMenuContent>
//             {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   className="cursor-pointer"
//                   onClick={() => {
//                     setLayout(item.toLowerCase() as CallLayoutType);
//                   }}
//                 >
//                   {item}
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//               </div>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>

//         <CallStatsButton />

//         <button onClick={() => setShowParticipants((prev) => !prev)}>
//           <div className="cursor-pointer rounded-2xl bg-accent-foreground/70 text-accent px-4 py-2 hover:bg-accent-foreground/50 duration-200">
//             <Users size={20} />
//           </div>
//         </button>

//         {!isPersonalRoom && <EndCallButton />}
//       </div>
//     </section>
//   );
// };
// export default MeetingRoom;

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
import { Users, MicOff, Aperture } from "lucide-react";
import { useSearchParams } from "next/navigation";
import EndCallButton from "./ui/end-call-button";
import Loader from "./loader";

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

const MeetingRoom = () => {
  const [showParticipants, setShowParticipants] = useState(false);
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const isMobile = useIsMobile();

  const { useCallCallingState, useIsCallRecordingInProgress } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const isRecording = useIsCallRecordingInProgress();

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
  const handleRecording = async () => {
    if (!call) return;
    if (isRecording) await call.stopRecording();
    else await call.startRecording();
  };

  // Mute all users (admin only)
  const handleMuteAll = async () => {
    if (!call) return;
    // Stream Video SDK does not provide a direct "mute all" method.
    // The recommended way is to send a custom event to all participants
    // instructing them to mute themselves.
    await call.sendCustomEvent({
      type: "mute-all",
      data: {},
    });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0D1B2A] text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full items-center max-w-[1400px]">
          <SpeakerLayout participantsBarPosition={null} />
        </div>

        {/* PARTICIPANT LIST */}
        {showParticipants && (
          <div
            className={cn(
              "bg-black px-2 py-4",
              isMobile
                ? "absolute top-0 right-0 z-50 h-full w-[70vw]"
                : "relative ml-2 h-[calc(100vh-86px)]"
            )}
          >
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-3 flex-wrap p-2 bg-[#0D1B2A]">
        <CallControls />

        {/* Admin-only buttons */}
        {isPersonalRoom && (
          <>
            <button
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
            </button>

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
    </section>
  );
};

export default MeetingRoom;
