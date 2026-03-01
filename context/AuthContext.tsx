"use client";
import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { authApi, sessionApi } from "@/lib/axios";
import { Bounce, toast } from "react-toastify";

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

  const tokenRef = useRef<string | null>(null);

  const customToastStyle = {
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
  };

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  // track navigator status
  useEffect(() => {
    const handleOnline = () => {
      toast.dismiss("network-status-offline");
      toast.success("Back online! Connection restored.", {
        position: "top-center",
        toastId: "network-status-online",
        transition: Bounce,
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: customToastStyle,
        theme: "dark",
      });
    };
    const handleOffline = () => {
      toast.dismiss("network-status-online");
      toast.error("You're offline! Please check your internet connection.", {
        position: "top-center",
        toastId: "network-status-offline",
        transition: Bounce,
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: customToastStyle,
        theme: "dark",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const patchStudent = async (updatedFields: Partial<any>) => {
    try {
      const response = await authApi.patch(
        `/update/${student?.id}`,
        updatedFields,
      );
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
      window.location.href = "/";
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
    let isMounted = true;

    const setupInterceptors = (apiInstance: any) => {
      // Request Interceptor
      apiInstance.interceptors.request.use((config: any) => {
        if (!config.headers["Authorization"] && tokenRef.current) {
          config.headers["Authorization"] = `Bearer ${tokenRef.current}`;
        }
        return config;
      });

      // Response Interceptor (Token Refresh Logic)
      apiInstance.interceptors.response.use(
        (res: any) => res,
        async (err: any) => {
          const prevRequest = err?.config;
          const isRefreshRequest = prevRequest.url?.includes("/refresh") || prevRequest.url?.includes("/login") || prevRequest.url?.includes("/register");

          // Avoid intercepting 401s on login/refresh itself to prevent loops
          if (
            err?.response?.status === 401 &&
            !prevRequest?._retry &&
            !isRefreshRequest
          ) {
            prevRequest._retry = true;
            try {
              const r = await authApi.post("/refresh");
              const newToken = r.data.accessToken;

              setAccessToken(newToken);
              prevRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return apiInstance(prevRequest);
            } catch (refreshErr) {
              setAccessToken(null);
              setStudent(null);
              return Promise.reject(refreshErr);
            }
          }
          return Promise.reject(err);
        },
      );
    };

    // Attach Interceptors once
    setupInterceptors(authApi);
    setupInterceptors(sessionApi);

    // Initial Session Hydration (Runs once on app boot)
    const bootApp = async () => {
      try {
        const response = await authApi.post("/refresh");
        if (isMounted) {
          setAccessToken(response.data.accessToken);
          setStudent(response.data.student);
        }
      } catch (err) {
        // Only set error if we are on a protected route
        const isPublic = ["/", "/register"].includes(window.location.pathname);
        if (!isPublic) setError("Session expired. Please log in.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootApp();
    return () => {
      isMounted = false;
    };
  }, []); // Re-run when accessToken changes

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
