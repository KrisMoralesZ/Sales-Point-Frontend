"use client";

import { useState } from "react";
import apiUrl from "@/services/requests";
import { AuthResponse, setAuth } from "@/services/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import styles from "./Forms.module.css";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    role: "Admin",
  });

  const handleChangeFormData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiUrl.post("/authentication/register", formData);

      const loginResponse = await apiUrl.post<AuthResponse>(
        "/authentication/login",
        {
          email: formData.email,
          password: formData.password,
        },
      );

      setAuth(loginResponse.data);
      toast.success("Account created successfully");
      router.push("/");
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Signup failed");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sign up</h1>
          <p className={styles.subtitle}>Enter your credentials to continue</p>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              className={styles.input}
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChangeFormData}
              required
              suppressHydrationWarning
            />
          </div>

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
              onChange={handleChangeFormData}
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
              onChange={handleChangeFormData}
              required
              suppressHydrationWarning
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="role">
              Role
            </label>
            <select
              className={styles.input}
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChangeFormData}
              required
            >
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>

        <button className={styles.button} type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
}
