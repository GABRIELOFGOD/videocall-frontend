"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Video,
  Plus,
  LogIn,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  PlayCircle,
  Loader,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { isError } from "@/utils/helper";

import { useUser } from "@/providers/UserProvider";
import { toast } from "sonner";
import { generateMeetId } from "@/lib/helper";
import { useRouter } from "next/navigation";
import { BASEURL } from "@/utils/constants";

const CreateMeetingPage = () => {
  const [meetingId, setMeetingId] = React.useState("");
  const { user, isLoaded } = useUser();

  const router = useRouter();

  const [meetingTitle, setMeetingTitle] = useState<string>("");
  const [meetingDesc, setMeetingDesc] = useState("");

  const [creatingMeeting, setCreatingMeeting] = useState(false);

  const handleCreateMeeting = async () => {
    if (isLoaded && !user) {
      toast.error(
        "Something went wrong, please check your connection and reload"
      );
      return;
    }
    try {
      setCreatingMeeting(true);
      const token = localStorage.getItem("token");
      if (!meetingTitle) {
        toast.error("Meeting must have a title");
        return;
      }
      const id = generateMeetId();
      const req = await fetch(`${BASEURL}/api/meet/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: meetingTitle.trim(),
          description: meetingDesc.trim(),
          meetingId: id,
        }),
      });

      const res = await req.json();

      if (!req.ok)
        throw new Error(res.error.message || "Failed to create meeting");
      if (!res.success)
        throw new Error(res.error.message || "Failed to create meeting");
      // const call = client.call("default", id);

      // if (!call) throw new Error("Failed to create call");

      // const startsAt = new Date(Date.now()).toISOString();

      // await call.getOrCreate({
      //   data: {
      //     starts_at: startsAt,
      //     custom: {
      //       meetingTitle,
      //     },
      //   },
      // });

      router.push(`/${id}`);
      toast.success("Meeting created");
    } catch (error: unknown) {
      if (isError(error)) {
        toast.error(error.message);
        console.error("Login failed", error.message);
      } else {
        console.error("Unknown error", error);
      }
    } finally {
      setCreatingMeeting(false);
    }
  };

  const gotoLogin = () => {
    router.push("/login")
  }

  const handleJoinMeeting = () => {
    if (!meetingId.trim()) {
      toast.error("Meeting ID is required");
      return;
    }
    router.push(`/${meetingId}`);
  };

  const handlePreviousMeetings = () => {
    // Handle previous meetings logic
    console.log("Opening previous meetings...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Coinconnect MeetSpace
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Beta
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200">
            Connect, Collaborate, Create
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Experience seamless video meetings with crystal-clear quality and
            intuitive controls. Join the future of remote collaboration.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Create Meeting */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Create Meeting
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Start an instant meeting and invite others
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Dialog>
                <DialogTrigger className="w-full">
                  <Button
                    disabled={!user}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 text-lg group-hover:shadow-lg transition-all duration-300"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Now
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new meeting link</DialogTitle>
                    <DialogDescription>
                      <div className="flex flex-col gap-3 mt-3">
                        <Input
                          className="w-full"
                          placeholder="Meeting title"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                        />
                        <textarea
                          value={meetingDesc}
                          onChange={(e) => setMeetingDesc(e.target.value)}
                          placeholder="Meeting description (optional)"
                          className="w-full p-4 rounded-md outline-border border-border border-2 max-h-[100px]"
                        ></textarea>
                        <Button
                          onClick={handleCreateMeeting}
                          size={"lg"}
                          disabled={!meetingTitle.trim() || creatingMeeting}
                        >
                          {creatingMeeting ? (
                            <div className="flex gap-2">
                              <Loader
                                size={15}
                                className="my-auto animate-spin"
                              />
                              <p className="my-auto text-sm font-bold">
                                Creating meeting
                              </p>
                            </div>
                          ) : (
                            "Create meeting"
                          )}
                        </Button>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardContent>
            {!user && <p className="text-sm font-semibold text-center mt-2 cursor-pointer"><span className="text-blue-500 font-bold hover:underline" onClick={gotoLogin}>Login</span> to create meeting</p>}
          </Card>

          {/* Join Meeting */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                Join Meeting
              </CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-300">
                Enter a meeting ID to join instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500 focus:border-emerald-500 py-6 text-lg"
              />
              <Button
                onClick={handleJoinMeeting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-6 text-lg group-hover:shadow-lg transition-all duration-300"
                disabled={!meetingId.trim()}
              >
                <Users className="w-5 h-5 mr-2" />
                Join Meeting
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Previous Meetings */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                Previous Meetings
              </CardTitle>
              <CardDescription className="text-purple-700 dark:text-purple-300">
                Access your meeting history and recordings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={handlePreviousMeetings}
                variant="outline"
                className="w-full border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 font-semibold py-6 text-lg group-hover:shadow-lg transition-all duration-300"
              >
                <Clock className="w-5 h-5 mr-2" />
                View History
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
            Why Choose MeetSpace?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                HD Quality
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Crystal clear video and audio for professional meetings
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                Team Collaboration
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Share screens, files, and collaborate in real-time
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                Smart Features
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                AI-powered noise cancellation and auto-transcription
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/20 bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>&copy; 2024 MeetSpace. Built for the future of remote work.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateMeetingPage;
