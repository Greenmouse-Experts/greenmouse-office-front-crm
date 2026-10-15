import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai/react";
import { getDefaultStore } from "jotai/vanilla";
interface UserData {
  id: string;
  email: string;
  companyName?: string;
  isOnboarded?: boolean;
  userType: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ProfileData {
  sub: string;
  email: string;
  companyName?: string;
  userType: string;
  isOnboarded?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  accessToken: string;
  refreshToken: string;
  user: UserData;
  profile?: ProfileData;
}

export const DEFAULT_ADMIN_SESSION: AuthUser = {
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOGM5YjVkZC0yMTIzLTQxNzQtODhkZi0wNDE0YzkyMDYxYWQiLCJlbWFpbCI6ImdyZWVubW91c2VkZXZAZ21haWwuY29tIiwidXNlclR5cGUiOiJhZG1pbiIsImlhdCI6MTc4OTM4OTg4OSwiZXhwIjoxNzg5MzkzNDg5fQ.WyMNKjaMWgetjsTeF6HMm4or_Igpo0eCwql2vusxUM0",
  refreshToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOGM5YjVkZC0yMTIzLTQxNzQtODhkZi0wNDE0YzkyMDYxYWQiLCJ1c2VyVHlwZSI6ImFkbWluIiwiaWF0IjoxNzg5Mzg5ODg5LCJleHAiOjE3ODk5OTQ2ODl9.ZXP8TWN-snRblJ0XnfS7vARw1HA52q6fvEzG1Xoo3bI",
  user: {
    id: "08c9b5dd-2123-4174-88df-0414c92061ad",
    email: "greenmousedev@gmail.com",
    firstName: "Greenmouse",
    lastName: "Admin",
    userType: "admin",
    companyName: "Greenmouse",
    isOnboarded: true,
  },
};

const getInitialUser = (): AuthUser | null => {
  try {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.accessToken) return parsed;
    }
  } catch (e) {
    console.error("Error parsing stored user", e);
  }
  return null;
};

export const user_atom = atomWithStorage<AuthUser | null>(
  "user",
  getInitialUser(),
);

const storedProfile =
  typeof window !== "undefined" ? localStorage.getItem("profile") : null;
export const profile_atom = atomWithStorage<ProfileData | null>(
  "profile",
  storedProfile ? JSON.parse(storedProfile) : null,
);

export const useAuth = () => {
  const [user, setUser] = useAtom(user_atom);
  return [user, setUser] as const;
};

export const useProfile = () => {
  const [profile, setProfile] = useAtom(profile_atom);
  return [profile, setProfile] as const;
};

export const get_user_value = () => {
  const store = getDefaultStore();
  return store.get(user_atom);
};

export const get_profile_value = () => {
  const store = getDefaultStore();
  return store.get(profile_atom);
};

export const clear_user = () => {
  const store = getDefaultStore();
  store.set(user_atom, null);
  store.set(profile_atom, null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  }
};

export const set_user_value = (user: AuthUser) => {
  const store = getDefaultStore();
  store.set(user_atom, user);
};

export const set_profile_value = (profile: ProfileData) => {
  const store = getDefaultStore();
  store.set(profile_atom, profile);
};
