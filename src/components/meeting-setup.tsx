"use client";

import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "@/providers/UserProvider";
import { Input } from "./ui/input";
import { toast } from "sonner";

const MeetingSetup = ({
  setIsSetUpComplete,
}: {
  setIsSetUpComplete: (value: boolean) => void;
}) => {
  const [isMicCamToggledOn, setIsMicCamToggeledOn] = useState<boolean>(false);
  const [username, setUsername] = useState("");

  const call = useCall();

  const { user, isLoaded } = useUser();

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
    if (isLoaded) {
      setUsername(user?.name || "");
    }
  }, [isLoaded, user]);

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
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="mx-auto w-full md:w-[400px]"
      />
      <Button
        disabled={!username.trim() || username === "user"}
        onClick={() => {
          if (!username.trim() || username === "user") {
            toast.error("Please enter your username");
            return;
          }
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
