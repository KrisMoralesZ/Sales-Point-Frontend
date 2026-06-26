"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_CHANGE_EVENT,
  getAuthenticatedHomePath,
  isAdmin,
  isAuthenticated,
  ROUTES,
} from "@/services/auth";

type AuthStatus = "loading" | "unauthenticated" | "forbidden" | "authorized";

interface RequireAdminProps {
  children: React.ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const syncAuth = () => {
      if (!isAuthenticated()) {
        setStatus("unauthenticated");
        return;
      }

      if (!isAdmin()) {
        setStatus("forbidden");
        return;
      }

      setStatus("authorized");
    };

    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(ROUTES.login);
      return;
    }

    if (status === "forbidden") {
      router.replace(getAuthenticatedHomePath());
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated" || status === "forbidden") {
    return null;
  }

  return <>{children}</>;
}
