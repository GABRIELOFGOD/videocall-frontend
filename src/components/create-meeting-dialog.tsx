"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";

const LOCAL_USER_KEY = "stream_guest_user";

const SentimentalComponent = ({
  setUserReady,
}: {
  setUserReady: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const { setUser } = useUser();

  const [guestName, setGuestName] = useState("");
  const [existingGuestId, setExistingGuestId] = useState<string | null>(null);

  // On mount, check if user was stored locally
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name && parsed?.id && parsed?.email) {
          setGuestName(parsed.name);
          setExistingGuestId(parsed.id);
        }
      } catch (err) {
        console.error("Invalid user in localStorage:", err);
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    }
  }, []);

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const handleContinueAsGuest = () => {
    const name = guestName.trim();
    if (!name) return;

    const guestUser = {
      id: existingGuestId || crypto.randomUUID(),
      name,
      email: `${name.replace(/\s+/g, "").toLowerCase()}@email.com`,
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    setUserReady(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h2 className="text-2xl font-semibold mb-2">We need your presence 🥹</h2>
      <p className="text-lg text-gray-600 mb-6">
        Please log in or continue as a guest below.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={handleLoginRedirect}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Log in
        </button>

        <div className="text-gray-500 text-sm">or</div>

        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Enter a guest name"
          className="px-4 py-2 border rounded-lg"
        />

        <button
          onClick={handleContinueAsGuest}
          disabled={guestName.trim() === ""}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default SentimentalComponent;
