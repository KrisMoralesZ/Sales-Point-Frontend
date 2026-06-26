"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_CHANGE_EVENT,
  getAuthenticatedHomePath,
} from "@/services/auth";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirect = () => {
      router.replace(getAuthenticatedHomePath());
    };

    redirect();
    window.addEventListener(AUTH_CHANGE_EVENT, redirect);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, redirect);
    };
  }, [router]);

  return null;
}
