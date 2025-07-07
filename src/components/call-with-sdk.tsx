"use client";

import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import MeetingSetup from "./meeting-setup";
import MeetingRoom from "./meeting-room";
import { useGetCall } from "@/hook/use-get-call";
import Loader from "./loader";
import { isError } from "@/utils/helper";
import { BASEURL } from "@/utils/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SDKComponent = ({ id }: { id: string }) => {
  const [isSetUpComplete, setIsSetUpComplete] = useState<boolean>(false);
  const [validatingCall, setValidating] = useState(true);
  const router = useRouter();

  const getAMeet = async () => {
    try {
      const req = await fetch(`${BASEURL}/api/meet/${id}`);
      const res = await req.json();
      if (!req.ok) throw new Error(res.error.message || "Cannot find meeting");
      console.log("[MEETIING RESPONSE]: ", res);
    } catch (error: unknown) {
      if (isError(error)) {
        toast.error(error.message);
        console.error("Meeting failed", error.message);
        router.back();
      } else {
        console.error("Unknown error", error);
        router.push("/");
      }
    } finally {
      setValidating(false);
    }
  }

  useEffect(() => {
    getAMeet();
  }, []);

  const { call, isCallLoading } = useGetCall(id);

  if (isCallLoading || validatingCall) return <Loader />
  
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