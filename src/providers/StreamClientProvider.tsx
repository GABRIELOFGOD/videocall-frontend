"use client";

import { ReactNode, useState, useEffect } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { user } from "@/data/user";
import { tokenProvider } from "@/actions/stream.actions";
import Loader from "@/components/loader";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();

  useEffect(() => {
    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.id,
        name: user.username || user.id,
        image: user.image
      },
      tokenProvider,
    });

    setVideoClient(client);
  }, [user]);

  if (!videoClient) {
    return <Loader />
  }
  
  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default StreamVideoProvider;