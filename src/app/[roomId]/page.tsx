import VideoCallPage from "@/components/video-call-page";
import { use } from "react";

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function CallPage({ params }: PageProps) {
  const { roomId } = use(params); // ✅ no await, no error
  return <VideoCallPage roomId={roomId} />;
}
