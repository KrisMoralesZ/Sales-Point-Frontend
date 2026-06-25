"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import apiUrl from "@/services/requests";
import { AuthResponse, setAuth } from "@/services/auth";
import styles from "./Forms.module.css";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await apiUrl.post<AuthResponse>(
        "/authentication/login",
        formData,
      );
      setAuth(response.data);
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Enter your credentials to continue</p>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              suppressHydrationWarning
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              suppressHydrationWarning
            />
          </div>
        </div>

        <button className={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
