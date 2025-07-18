"use client";

import {
  DeviceSettings,
  useCall,
  VideoPreview,
  CustomVideoEvent,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useUser } from "@/providers/UserProvider";

const MeetingSetup = ({
  setIsSetUpComplete,
}: {
  setIsSetUpComplete: (value: boolean) => void;
}) => {
  const [isMicCamToggledOn, setIsMicCamToggeledOn] = useState<boolean>(false);
  const [sentRequest, setSentRequest] = useState<boolean>(false);
  const [requestRejected, setRequestRejected] = useState<boolean>(false);

  const { user: callUser } = useUser();

  const call = useCall();

  if (!call) throw new Error("Something went wrong while preparing your call");

  useEffect(() => {
    if (isMicCamToggledOn) {
      call?.camera.disable();
      call?.microphone.disable();
    } else {
      call?.camera.enable();
      call?.microphone.enable();
    }
  }, [isMicCamToggledOn, call?.camera, call?.microphone]);

  useEffect(() => {
    if (call) {
      call.on("custom", (event: CustomVideoEvent) => {
        const payload = event.custom;
        console.log("[PAYLOAD]: ", payload);
        if (payload.type === "request_accepted") {
          if (payload.users.length > 0) {
            payload.users.some((user: string) => {
              if (user === call.currentUserId) {
                call.join();
                setIsSetUpComplete(true);
                setSentRequest(false);
              }
            })
          }
        }

        if (payload.type === "request_rejected") {
          if (payload.users.length > 0) {
            payload.users.some((user: string) => {
              if (user === call.currentUserId) {
                setSentRequest(false);
                setRequestRejected(true);
              }
            })
          }
        }
      });
    }
  }, [call]);

  const requestToJoinCall = async () => {
    if (sentRequest) return;
    setSentRequest(true);
    setRequestRejected(false);
    try {
      call.sendCustomEvent({
        type: "join_request",
        // user: call.currentUserId
        user: {
          name: callUser?.name,
          id: call.currentUserId
        }
      });
    } catch (error) {
      toast.error("Error sending request to join room");
      setSentRequest(false);
      console.log(error);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-full flex-col gap-3">
      <h1 className="text-2xl font-bold">Setup</h1>
      <div className="mx-auto w-full md:w-[500px] text-center flex items-center justify-center">
        <VideoPreview />
      </div>

      <div className="flex h-16 items-center justify-center gap-3">
        <label
          className="flex items-center justify-center gap-2 font-medium"
          htmlFor="cam"
        >
          <input
            type="checkbox"
            checked={isMicCamToggledOn}
            onChange={(e) => setIsMicCamToggeledOn(e.target.checked)}
            id="cam"
          />
          Join with camera off
        </label>
        <DeviceSettings />
      </div>
      <p className="text-sm text-center text-red-400">{requestRejected && "Your request to join the call was rejected"}</p>
      <Button
        // onClick={() => {
        //   call.join();
        //   setIsSetUpComplete(true);
        // }}
        onClick={call.isCreatedByMe ? () => {
          call.join();
          setIsSetUpComplete(true);
        } : requestToJoinCall}
        disabled={sentRequest}
      >
        {sentRequest ? "Requesting to join..." : "Join meeting"}
      </Button>
    </div>
  );
};

export default MeetingSetup;
