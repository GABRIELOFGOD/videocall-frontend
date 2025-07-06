"use client";

import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useState } from "react";
import MeetingSetup from "./meeting-setup";
import MeetingRoom from "./meeting-room";
import { useGetCall } from "@/hook/use-get-call";
import Loader from "./loader";

const SDKComponent = ({ id }: { id: string }) => {
  const [isSetUpComplete, setIsSetUpComplete] = useState<boolean>(false);

  const { call, isCallLoading } = useGetCall(id);

  if (isCallLoading) return <Loader />
  
  return (
    <div className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetUpComplete ?
          <MeetingSetup
            setIsSetUpComplete={setIsSetUpComplete}
          /> :
          <MeetingRoom />}
        </StreamTheme>
      </StreamCall>
    </div>
  )
}
export default SDKComponent;