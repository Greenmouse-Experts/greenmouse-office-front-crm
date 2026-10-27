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
  profilePic?: string | null;
  companyId?: string;
  permissions?: string[];
}

export interface ProfileData extends UserData {
  role?: { name: string };
  sub?: string;
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

export const DEFAULT_STAFF_SESSION: AuthUser = {
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MzYzOGQwYy03YzcwLTQ3NmQtOGM4NS0yYjQzOGEzNTI4NWQiLCJlbWFpbCI6Im93bmVyQGV4YW1wbGUuY29tIiwidXNlclR5cGUiOiJzdGFmZiIsInJvbGVJZCI6IjFjY2VkMjE0LTJlMmItNGMwZi05YWI5LTRmOGE3OGI5MDEzYyIsImNvbXBhbnlJZCI6Ijk2OWI1N2E2LTZjNzgtNGE3OS04ZjgyLTAzYmM1NzA5OGI1NyIsInBlcm1pc3Npb25zIjpbImRhc2hib2FyZDp2aWV3Iiwic3RhZmZzOmNyZWF0ZSIsInN0YWZmczpyZWFkIiwic3RhZmZzOnVwZGF0ZSIsInN0YWZmczpkZWxldGUiLCJyb2xlczpjcmVhdGUiLCJyb2xlczpyZWFkIiwicm9sZXM6dXBkYXRlIiwicm9sZXM6ZGVsZXRlIiwiY3VzdG9tZXJzOmNyZWF0ZSIsImN1c3RvbWVyczpyZWFkIiwiY3VzdG9tZXJzOnVwZGF0ZSIsImN1c3RvbWVyczpkZWxldGUiLCJjb21wYW5pZXM6Y3JlYXRlIiwiY29tcGFuaWVzOnJlYWQiLCJjb21wYW5pZXM6dXBkYXRlIiwiY29tcGFuaWVzOmRlbGV0ZSIsInByb2R1Y3RzOmNyZWF0ZSIsInByb2R1Y3RzOnJlYWQiLCJwcm9kdWN0czp1cGRhdGUiLCJwcm9kdWN0czpkZWxldGUiLCJzZXJ2aWNlczpjcmVhdGUiLCJzZXJ2aWNlczpyZWFkIiwic2VydmljZXM6dXBkYXRlIiwic2VydmljZXM6ZGVsZXRlIiwiY2F0ZWdvcmllczpjcmVhdGUiLCJjYXRlZ29yaWVzOnJlYWQiLCJjYXRlZ29yaWVzOnVwZGF0ZSIsImNhdGVnb3JpZXM6ZGVsZXRlIiwiaW5jb21lX2V4cGVuc2VzOmNyZWF0ZSIsImluY29tZV9leHBlbnNlczpyZWFkIiwiaW5jb21lX2V4cGVuc2VzOnVwZGF0ZSIsImluY29tZV9leHBlbnNlczpkZWxldGUiLCJpbnZvaWNlczpjcmVhdGUiLCJpbnZvaWNlczpyZWFkIiwiaW52b2ljZXM6dXBkYXRlIiwiaW52b2ljZXM6ZGVsZXRlIiwicXVvdGVzOmNyZWF0ZSIsInF1b3RlczpyZWFkIiwicXVvdGVzOnVwZGF0ZSIsInF1b3RlczpkZWxldGUiLCJhbmFseXNpczp2aWV3IiwidHJhbnNhY3Rpb25zOmNyZWF0ZSIsInRyYW5zYWN0aW9uczpyZWFkIiwidHJhbnNhY3Rpb25zOnVwZGF0ZSIsInRyYW5zYWN0aW9uczpkZWxldGUiLCJvcmRlcnM6Y3JlYXRlIiwib3JkZXJzOnJlYWQiLCJvcmRlcnM6dXBkYXRlIiwib3JkZXJzOmRlbGV0ZSIsInN1cHBvcnQ6Y3JlYXRlIiwic3VwcG9ydDpyZWFkIiwic3VwcG9ydDp1cGRhdGUiLCJzdXBwb3J0OmRlbGV0ZSIsInBheW1lbnRzOmluaXRpYWxpemUiLCJwYXltZW50czp2ZXJpZnkiLCJwYXltZW50czp2aWV3Iiwic2V0dGluZ3M6cmVhZCIsInNldHRpbmdzOnVwZGF0ZSIsImxlYWRzOmNyZWF0ZSIsImxlYWRzOnJlYWQiLCJsZWFkczp1cGRhdGUiLCJsZWFkczpkZWxldGUiLCJsZWFkczpjb252ZXJ0IiwicGlwZWxpbmVzOmNyZWF0ZSIsInBpcGVsaW5lczpyZWFkIiwicGlwZWxpbmVzOnVwZGF0ZSIsInBpcGVsaW5lczpkZWxldGUiLCJkZWFsczpjcmVhdGUiLCJkZWFsczpyZWFkIiwiZGVhbHM6dXBkYXRlIiwiZGVhbHM6ZGVsZXRlIiwiZGVhbHM6bW92ZV9zdGFnZSIsInRhc2tzOmNyZWF0ZSIsInRhc2tzOnJlYWQiLCJ0YXNrczp1cGRhdGUiLCJ0YXNrczpkZWxldGUiXSwiaWF0IjoxNzkyMDk5Mjc2LCJleHAiOjE3OTIxMDI4NzZ9.-TyKDasHnm64516VAQ0vCLg8zP3g_6HbiqdFffWlnug",
  refreshToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MzYzOGQwYy03YzcwLTQ3NmQtOGM4NS0yYjQzOGEzNTI4NWQiLCJ1c2VyVHlwZSI6InN0YWZmIiwiaWF0IjoxNzkyMDk5Mjc2LCJleHAiOjE3OTI3MDQwNzZ9.We9ZBO-P1OilaRdST9BdpiOrbcKLyF_A45Dp4FWnRuI",
  user: {
    id: "83638d0c-7c70-476d-8c85-2b438a35285d",
    email: "owner@example.com",
    firstName: "Company",
    lastName: "Owner",
    userType: "staff",
    companyId: "969b57a6-6c78-4a79-8f82-03bc57098b57",
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
