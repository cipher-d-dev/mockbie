"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NavBar } from "../ui/Navbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { student, loading } = useAuth();
  const router = useRouter();

  // ✅ Stable version
  useEffect(() => {
    let isMounted = true;
    if (!loading && !student && isMounted) {
      router.replace("/"); // Use replace instead of push for auth redirects
    }
    return () => {
      isMounted = false;
    };
  }, [student, loading, router]);

  // IMPROVEMENT: Show the "Shell" of the app immediately
  // This prevents the "blank page" feel and makes the app feel faster.
  return (
    <div className="min-h-screen font-inter bg-[#F9FAFB]">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <NavBar />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Show a nice loading state instead of null
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="h-12 w-12 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-zinc-500 animate-pulse">
                Loading your dashboard...
              </p>
            </div>
          ) : student ? (
            children
          ) : null}
        </div>
      </main>
    </div>
  );
}
