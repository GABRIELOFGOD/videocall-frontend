"use client";

import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const MeetingSetup = ({
  setIsSetUpComplete,
}: {
  setIsSetUpComplete: (value: boolean) => void;
}) => {
  const [isMicCamToggledOn, setIsMicCamToggeledOn] = useState<boolean>(false);

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
      <Button
        onClick={() => {
          call.join();
          setIsSetUpComplete(true);
        }}
      >
        Join meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
