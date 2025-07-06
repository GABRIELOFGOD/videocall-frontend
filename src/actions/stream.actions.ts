"use server";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;
import { user } from "@/data/user";
import { StreamClient } from "@stream-io/node-sdk"

export const tokenProvider = async () => {

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