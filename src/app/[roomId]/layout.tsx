import { ReactNode } from "react";
import StreamVideoProvider from "@/providers/StreamClientProvider";

const CallRoomLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <StreamVideoProvider>
        {children}
      </StreamVideoProvider>
    </div>
  )
}
export default CallRoomLayout;