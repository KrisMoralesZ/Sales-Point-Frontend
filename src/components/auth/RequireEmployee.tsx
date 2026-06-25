"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AUTH_CHANGE_EVENT,
  isAuthenticated,
  isEmployee,
} from "@/services/auth";
import styles from "./RequireAdmin.module.css";

type AuthStatus = "loading" | "unauthenticated" | "forbidden" | "authorized";

interface RequireEmployeeProps {
  children: React.ReactNode;
}

export default function RequireEmployee({ children }: RequireEmployeeProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const syncAuth = () => {
      if (!isAuthenticated()) {
        setStatus("unauthenticated");
        return;
      }

      if (!isEmployee()) {
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
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  if (status === "forbidden") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.panel}>
          <h1 className={styles.title}>Access denied</h1>
          <p className={styles.message}>
            You need employee permissions to view this page.
          </p>
          <Link href="/" className={styles.link}>
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
