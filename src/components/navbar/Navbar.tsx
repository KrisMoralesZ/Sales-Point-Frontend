"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AUTH_CHANGE_EVENT,
  isAdmin,
  isEmployee,
  isAuthenticated,
} from "@/services/auth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [employee, setEmployee] = useState(false);
  useEffect(() => {
    const syncAuth = () => {
      setAuthenticated(isAuthenticated());
      setAdmin(isAdmin());
      setEmployee(isEmployee());
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
        {admin && (
          <Link
            href="/admin/products"
            className={`${styles.link} ${
              pathname.startsWith("/admin/products") ? styles.activeLink : ""
            }`}
          >
            Products
          </Link>
        )}
        {employee && (
          <Link
            href="/sales-point"
            className={`${styles.link} ${
              pathname.startsWith("/sales-point") ? styles.activeLink : ""
            }`}
          >
            Sales Point
          </Link>
        )}
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
