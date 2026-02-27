"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { student, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && student) {
      setIsRedirecting(true);
      
      // Notify the user
      toast.info("You are already logged in. Redirecting to dashboard...", {
        toastId: "already-logged-in", // Prevents duplicate toasts
      });

      // Redirect after a short delay
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [student, loading, router]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <p className="mt-4 text-sm text-zinc-500">Checking session...</p>
      </div>
    );
  }

  // If no student, show the login/register form
  return <>{!student ? children : null}</>;
}