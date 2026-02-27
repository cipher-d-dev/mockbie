"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BookOpen,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown,
  PlusCircle,
  Layers,
  LayoutDashboard,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { sessionApi } from "@/lib/axios";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { student, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !student) {
      router.push("/");
    }
  }, [student, loading, router]);

  if (!student) return null;

  const handleMonoSessionCreation = async () => {
    const res = await sessionApi.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500"}/api/sessions/mono/create`,
      {
        title: "New Mono Session",
      },
    );
    const { _id } = res.data.session;
    router.push(`/sessions/mono/${_id}`); // Redirect to the unique session page
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    // font-inter provides that clean, geometric "Google Sans" look
    <div className="min-h-screen font-inter bg-[#F9FAFB]">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO SECTION */}
          <div
            className="flex items-center gap-2.5 text-zinc-900 cursor-pointer group"
            onClick={() =>
              router.push(student.role === "admin" ? "/admin" : "/dashboard")
            }
          >
            <div className="bg-zinc-900 p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-google-sans-flex font-bold tracking-tight">
              Mockbie
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* SESSION DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 font-inter border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
                >
                  <PlusCircle className="w-4 h-4 sm:mr-2 text-zinc-500" />
                  <span className="hidden sm:inline font-medium text-sm">
                    Session
                  </span>
                  <ChevronDown className="ml-1 w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 rounded-xl font-inter shadow-xl border-zinc-200"
              >
                <DropdownMenuLabel className="text-xs font-bold font-inter text-zinc-400 px-2 py-2 uppercase tracking-widest">
                  Manage Sessions
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100" />
                <DropdownMenuItem
                  onClick={handleMonoSessionCreation}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-zinc-50"
                >
                  <PlusCircle className="mr-3 h-4 w-4 text-zinc-400" />
                  <span className="font-medium text-zinc-500">
                    Create Mono Session
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/admin/multi")}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-zinc-50"
                >
                  <Layers className="mr-3 h-4 w-4 text-zinc-400" />
                  <span className="font-medium text-zinc-500">
                    Create Multi Session
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/admin")}
                  className="rounded-lg py-2.5 cursor-pointer focus:bg-zinc-50"
                >
                  <Lock className="mr-3 h-4 w-4 text-zinc-400" />
                  <span className="font-medium text-zinc-500">
                    View Admin Dashboard
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* SETTINGS */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              className="h-9 w-9 sm:w-auto sm:px-3 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            >
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline font-medium text-sm">
                Settings
              </span>
            </Button>

            {/* DIVIDER */}
            <div className="h-6 w-[1px] bg-zinc-200 mx-1 hidden sm:block" />

            {/* USER PROFILE & LOGOUT */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end px-2">
                <span className="text-sm font-semibold text-zinc-900 leading-tight">
                  {student.fullName}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                    {student.role}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
