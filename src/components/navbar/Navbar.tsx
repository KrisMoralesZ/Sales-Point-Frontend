"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_CHANGE_EVENT, isAuthenticated } from "@/services/auth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setAuthenticated(isAuthenticated());
    };

    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
    };
  }, [pathname]);

  return (
    <nav className={styles.wrapper}>
      <div className={styles.left}>
        <Link href="/" className={styles.link}>
          Home
        </Link>
      </div>

      {!authenticated ? (
        <ul className={styles.right}>
          <li>
            <Link href="/login" className={styles.link}>
              Login
            </Link>
          </li>
          <li>
            <Link href="/signup" className={styles.buttonLink}>
              Sign Up
            </Link>
          </li>
        </ul>
      ) : (
        <ul className={styles.right}>
          <li>
            <Link href="/profile" className={styles.link}>
              Profile
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
