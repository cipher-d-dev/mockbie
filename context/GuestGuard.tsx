"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { student, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && student) {
      router.replace("/dashboard");
    }
  }, [student, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] p-6 font-inter">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo Skeleton */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-zinc-200 rounded-xl animate-shimmer" />
          </div>

          {/* Text Loader */}
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-zinc-200 rounded-md animate-shimmer mx-auto" />
            <div className="h-3 w-1/2 bg-zinc-100 rounded-md animate-shimmer mx-auto" />
          </div>

          {/* Visual Progress Bar */}
          <div className="relative w-full h-1 bg-zinc-100 rounded-full overflow-hidden mt-8">
            <div
              className="absolute top-0 left-0 h-full w-1/3 bg-zinc-900 animate-[shimmer_2s_infinite_linear]"
              style={{ width: "40%", transition: "all 0.5s ease" }}
            />
          </div>

          <p className="text-center text-zinc-400 text-xs font-bold uppercase tracking-widest mt-4">
            Checking Session...
          </p>
        </div>
      </div>
    );
  }


  return <>{!student ? children : null}</>;
}
