"use client";

import { ReactNode, useState, useEffect } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { tokenProvider } from "@/actions/stream.actions";
import Loader from "@/components/loader";
import { useUser } from "./UserProvider";
import SentimentalComponent from "@/components/create-meeting-dialog";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        setUserReady(false);
        return;
      }

      setUserReady(true);

      const client = new StreamVideoClient({
        apiKey,
        user: {
          id: user.id,
          name: user.name || user.id,
        },
        tokenProvider: () => tokenProvider(user),
      });

      setVideoClient(client);
    }
  }, [user, isLoaded]);

  if (!isLoaded) return <Loader />;
  if (!userReady) return <SentimentalComponent setUserReady={setUserReady} />;
  if (!videoClient) return <Loader />;

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
};

export default StreamVideoProvider;
