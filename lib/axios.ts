import axios from "axios";

const authApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500"}/api/auth`,
  withCredentials: true, // Required to send/receive cookies
});

const sessionApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500"}/api/sessions`,
  withCredentials: true, // Required to send/receive cookies
});

export { authApi, sessionApi };
