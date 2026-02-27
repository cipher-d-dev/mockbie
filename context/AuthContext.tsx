"use client";
import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
} from "react";
import { authApi } from "@/lib/axios";

interface Student {
  id: string;
  [key: string]: any;
}

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  student: Student | null;
  setStudent: (student: Student | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  login: (email: string, password: string) => Promise<void>;
  patchStudent: (updatedFields: Partial<any>) => Promise<void>;
  register: (
    fullName: string,
    username: string,
    matriculationNumber: string,
    email: string,
    password: string,
  ) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Persist user
  useLayoutEffect(() => {
    const hydrateSession = async () => {
      try {
        const response = await authApi.post("/refresh");
        setAccessToken(response.data.accessToken);
        console.log("Hydrated student on boot:", response.data.student);
        setStudent(response.data.student);
      } catch (err) {
        setError("No active session found on boot.");
      } finally {
        setLoading(false);
      }
    };
    hydrateSession();
  }, []);
 
  const patchStudent = async (updatedFields: Partial<any>) => {
    try {
      const response = await authApi.patch(`/update/${student?.id}`, updatedFields);
      setStudent(response.data.student);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update user");
      throw err;
    } finally {
    }
  };

  const login = async (matriculationNumber: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.post("/login", {
        matriculationNumber,
        password,
      });
      setAccessToken(response.data.accessToken);
      setStudent(response.data.student);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      let finalMessage = "An error occurred during login";
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors?.body) {
          const firstValidationErrorKey = Object.keys(data.errors.body)[0];
          finalMessage = data.errors.body[firstValidationErrorKey];
        } else if (data.error) {
          finalMessage = data.error;
        }
      } else {
        finalMessage = err.message || finalMessage;
      }

      setError(finalMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setStudent(null);
      setLoading(false);
    }
  };

  const register = async (
    fullName: string,
    username: string,
    matriculationNumber: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);
    try {
      const response = await authApi.post("/register", {
        fullName,
        username,
        matriculationNumber,
        email,
        password,
      });
      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        setStudent(response.data.student);
      }

      return response.data;
    } catch (err: any) {
      setLoading(false);
      let finalMessage = "An error occurred during registration";
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors?.body) {
          const firstValidationErrorKey = Object.keys(data.errors.body)[0];
          finalMessage = data.errors.body[firstValidationErrorKey];
        } else if (data.error) {
          finalMessage = data.error;
        }
      } else {
        finalMessage = err.message || finalMessage;
      }

      setError(finalMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // useLayoutEffect runs before the browser repaints, preventing "token flash"
  useLayoutEffect(() => {
    // 1. ATTACH TOKEN TO REQUESTS
    const requestIntercept = authApi.interceptors.request.use(
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
    const responseIntercept = authApi.interceptors.response.use(
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
            return authApi(prevRequest);
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
      authApi.interceptors.request.eject(requestIntercept);
      authApi.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken]); // Re-run when accessToken changes

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        student,
        setStudent,
        loading,
        setLoading,
        error,
        register,
        setError,
        login,
        logout,
        patchStudent,
      }}
    >
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          {/* You can replace this with a proper Spinner component */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
