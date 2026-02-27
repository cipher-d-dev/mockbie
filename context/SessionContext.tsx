"use client";
import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
  useEffect,
} from "react";
import { authApi, sessionApi } from "@/lib/axios";

interface Student {
  id: string;
  [key: string]: any;
}

interface SessionContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // useLayoutEffect runs before the browser repaints, preventing "token flash"
  useLayoutEffect(() => {
    // 1. ATTACH TOKEN TO REQUESTS
    const requestIntercept = sessionApi.interceptors.request.use(
      (config) => {
        // If we have a token in state, add it to the header
        if (!config.headers["Authorization"] && accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 2. HANDLE EXPIRED TOKEN (401)
    const responseIntercept = sessionApi.interceptors.response.use(
      (response) => response, // If request is successful, just return it
      async (error) => {
        const prevRequest = error?.config;

        // If status is 401 and we haven't tried refreshing yet
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true; // Mark this request so we don't loop forever

          try {
            // Call the Express refresh route (Cookie is sent automatically)
            const response = await authApi.post("/refresh");
            const newAccessToken = response.data.accessToken;

            setAccessToken(newAccessToken);

            // Update the failed request with the NEW token and retry it
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return sessionApi(prevRequest);
          } catch (refreshError) {
            // Refresh token is expired too (Redis key deleted or 7 days passed)
            setAccessToken(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    // Cleanup interceptors on unmount
    return () => {
      sessionApi.interceptors.request.eject(requestIntercept);
      sessionApi.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken]); // Re-run when accessToken changes

  return (
    <SessionContext.Provider
      value={{
        accessToken,
        setAccessToken,
      }}
    >
        {children}
    </SessionContext.Provider>
  );
};