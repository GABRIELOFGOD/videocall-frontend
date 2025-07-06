import SDKComponent from "@/components/call-with-sdk";
import { use } from "react";

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function CallPage({ params }: PageProps) {
  const { roomId } = use(params);
  return <SDKComponent id={roomId} />;
}
