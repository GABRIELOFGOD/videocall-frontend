"use client";

import { isError } from "@/utils/helper";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { BASEURL } from "@/utils/constants";

// Define the User interface
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

// Define the shape of the context
interface UserContextType {
  user: User | null;
  isLoaded: boolean;
  setUser: Dispatch<SetStateAction<User | null>>
}

const UserProviderContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const res = await fetch(`${BASEURL}/api/users/profile`, {
        method: "GET",
        headers: {
          "authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch user");

      const data: User = await res.json();
      setUser(data);
    } catch (error: unknown) {
      if (isError(error)) {
        console.error("Login failed", error.message);
      } else {
        console.error("Unknown error", error);
      }
      const userFromLocalStorage = localStorage.getItem("user");
      if (userFromLocalStorage) {
        setUser(JSON.parse(userFromLocalStorage));
      } else {
        setUser({
          id: crypto.randomUUID(),
          email: "email@mail.com",
          name: "user"
        });
      }
    } finally {
      setIsLoaded(true);
      console.log("LOADED");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserProviderContext.Provider value={{ user, isLoaded, setUser }}>
      {children}
    </UserProviderContext.Provider>
  );
};

export default UserProvider;

// Hook to use the context
export const useUser = () => {
  const context = useContext(UserProviderContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
