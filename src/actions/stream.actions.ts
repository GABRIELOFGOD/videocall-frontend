"use server";

// const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
// const apiSecret = process.env.STREAM_SECRET_KEY;
// let apiKey = "";
// let apiSecret = "";
import { User } from "@/providers/UserProvider";
// import { BASEURL } from "@/utils/constants";
// import { isError } from "@/utils/helper";
import { StreamClient } from "@stream-io/node-sdk"
// import { toast } from "sonner";

export const tokenProvider = async (user: User, apiKey: string, apiSecret: string) => {
  // const getVaribales = async () => {
    // try {
    //   const req = await fetch(`${BASEURL}/api/environment`);
    //   const res = await req.json();
    //   if (!req.ok) throw new Error(res.error.message);
    //   apiKey = res.api_key;
    //   apiSecret = res.api_secret
    // } catch  (error: unknown) {
    //   if (isError(error)) {
    //     toast.error(error.message);
    //     console.error(error.message);
    //   } else {
    //     console.error("Unknown error", error);
    //   }
    // }
  // }

  if (!user) throw new Error("User not logged In");
  if (!apiKey) throw new Error("API key not found");
  if (!apiSecret) throw new Error("API secret key not found");

  const client = new StreamClient(apiKey, apiSecret);

  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;

  const issued = Math.floor(Date.now() / 1000) - 60;

  const token = client.generateUserToken({
    user_id: user.id,
    exp,
    iat: issued
  });

  return token;
}