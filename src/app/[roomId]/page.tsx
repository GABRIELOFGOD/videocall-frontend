import VideoCallPage from "@/components/video-call-page"

interface PageProps {
  params: {
    roomId: string
  }
}

export default async function CallPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { roomId } = resolvedParams;
  return <VideoCallPage roomId={roomId} />
}