"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { user } from "@/data/user";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { generateMeetId } from "@/lib/helper";
import { toast } from "sonner";

const CreateMeetingPage = () => {
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: ""
  });
  const [callDetails, setCallDetails] = useState<Call>();
  
  const router = useRouter();

  const client = useStreamVideoClient();

  useEffect(() => {
    setValues({
      dateTime: new Date(),
      description: "",
      link: ""
    });
  }, []);

  const createMeeting = async () => {
    console.log(callDetails);
    if (!user || !client) return;
    try {
      const id = generateMeetId();
      const call = client.call("default", id);

      if (!call) throw new Error("Failed to create call");

      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Start instant meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description
          }
        }
      });

      setCallDetails(call);
      if (!values.description) {
        router.push(`/${call.id}`);
      }

      toast.success("Meeting created");
    } catch (error) {
      console.log(error);
    }
  } 
  
  return (
    <div className="w-[350px] mx-auto flex justify-center items-center h-fit p-4 bg-white gap-2 flex-col">
      <Button
        onClick={createMeeting}
        className="w-full"
      >
        Join meeting
      </Button>
    </div>
  )
}
export default CreateMeetingPage;