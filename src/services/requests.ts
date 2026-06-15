import axios, { AxiosInstance } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiUrl: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiUrl;
