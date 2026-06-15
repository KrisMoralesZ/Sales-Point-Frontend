"use client";

import { useState } from "react";
import axios from "axios";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
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
      const response = await axios.post("/api/login", formData);
      console.log("Login successful:", response.data);
      // Handle successful login, e.g., redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login failure, e.g., show error message
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          suppressHydrationWarning
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
          suppressHydrationWarning
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
