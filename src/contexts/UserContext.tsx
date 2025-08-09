import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ensureSeedsLoaded,
  getLocal,
  setLocal,
  storageKeys,
} from "../data/seed-loader";

type User = { id: string };

const UserContext = createContext<User>({ id: "user_local" });

export function useUser(): User {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({ id: "user_local" });
  useEffect(() => {
    ensureSeedsLoaded().then(() => {
      const data = getLocal<User>(storageKeys.USER_KEY, { id: "user_local" });
      setUser(data);
      setLocal(storageKeys.USER_KEY, data);
    });
  }, []);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
