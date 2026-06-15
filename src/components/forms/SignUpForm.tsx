"use client";

import { useState } from "react";
import axios from "axios";
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
    role: "",
  } as SignUpFormData);

  const handleChangeFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/authentication/register", formData);
      console.log("Signup successful:", response.data);
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
              autoComplete="role"
              defaultValue={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            >
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>

        <button className={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
