"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Trophy,
  Clock,
  MoreVertical,
  Brain,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { sessionApi } from "@/lib/axios";
import { toast } from "react-toastify";

interface Session {
  _id: string;
  title: string;
  status: "draft" | "active" | "completed";
  type: "mono" | "multi";
  createdAt: string;
  results?: {
    percentage: number;
    score: number;
    totalQuestions: number;
  };
}

export function StudyHistory({
  sessions,
  onRefresh,
}: {
  sessions: Session[];
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await sessionApi.delete(`/${deletingId}`);
      toast.success("Session deleted successfully");
      onRefresh();
    } catch (err) {
      toast.error("Failed to delete session");
    } finally {
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/50">
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
          <Brain className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900">No sessions yet</h3>
        <p className="text-sm text-zinc-500 max-w-[250px] text-center mt-1">
          Upload a PDF to generate your first AI-powered study session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between px-1">
        <div>
          <h3 className="text-2xl font-black font-inter tracking-tight text-zinc-900">
            Recent Activity
          </h3>
          <p className="text-sm text-zinc-500">
            Track your progress and retake quizzes.
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-zinc-200 text-zinc-400 font-bold bg-white/50 backdrop-blur-sm"
        >
          {sessions.length} SESSIONS
        </Badge>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {sessions.map((session, index) => {
            const isCompleted = session.status === "completed";
            const score = session.results?.percentage || 0;

            // Soft Score Logic Palette
            const isGold = score >= 85;
            const isSilver = score >= 50 && score < 85;

            // Soft Color mapping
            const theme = !isCompleted
              ? {
                  bg: "bg-blue-50/50",
                  iconBg: "bg-blue-100/80",
                  text: "text-blue-500",
                  border: "group-hover:border-blue-200",
                  label: "In Progress",
                }
              : isGold
                ? {
                    bg: "bg-amber-50/40",
                    iconBg: "bg-amber-100/60",
                    text: "text-amber-600/80",
                    border: "group-hover:border-amber-200",
                    label: "Mastery",
                  }
                : isSilver
                  ? {
                      bg: "bg-slate-50/60",
                      iconBg: "bg-slate-200/50",
                      text: "text-slate-500",
                      border: "group-hover:border-slate-300",
                      label: "Achieved",
                    }
                  : {
                      bg: "bg-rose-50/40",
                      iconBg: "bg-rose-100/50",
                      text: "text-rose-400",
                      border: "group-hover:border-rose-200",
                      label: "Needs Review",
                    };

            return (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => router.push(`/sessions/mono/${session._id}`)}
                className={`group relative flex items-center justify-between p-5 bg-white border border-zinc-100 rounded-2xl hover:shadow-xl hover:shadow-zinc-200/30 transition-all duration-300 cursor-pointer overflow-hidden ${theme.border}`}
              >
                {/* Subtle Glossy Background layer */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme.bg}`}
                />

                <div className="flex items-center gap-5 relative z-10">
                  <div
                    className={`hidden sm:flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${theme.iconBg} ${theme.text}`}
                  >
                    {isCompleted ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-zinc-800 text-lg tracking-tight leading-tight">
                        {session.title}
                      </p>
                      <Badge className="bg-zinc-100/80 text-zinc-400 border-none text-[9px] font-bold tracking-widest uppercase h-4 px-1">
                        {session.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 opacity-70" />
                        {new Date(session.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-zinc-200" />
                      <span
                        className={`flex items-center gap-1 font-semibold ${theme.text}`}
                      >
                        {theme.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 relative z-10">
                  {isCompleted && (
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-2xl font-black tracking-tighter ${theme.text}`}
                        >
                          {score}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-300">
                          %
                        </span>
                      </div>
                      <p className="text-[9px] uppercase font-black text-zinc-300 tracking-widest leading-none">
                        SCORE
                      </p>
                    </div>
                  )}

                  <div className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-300 hover:text-zinc-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl font-inter shadow-xl border-zinc-100 p-1 backdrop-blur-md bg-white/90"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/sessions/mono/${session._id}`)
                          }
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-rose-500 focus:text-rose-600 focus:bg-rose-50/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(session._id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div
                      className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-full transition-all ml-2 bg-zinc-50 text-zinc-300 group-hover:translate-x-1 ${theme.text} group-hover:bg-white`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent
          className="max-w-[380px] rounded-[32px] top-[50%] left-[50%] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-0 overflow-hidden backdrop-blur-2xl bg-white/80 font-inter"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 pt-10">
            <AlertDialogHeader className="flex flex-col items-center text-center">
              {/* Animated Icon Container */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-rose-200/40 blur-2xl rounded-full scale-150" />
                <div className="relative h-20 w-20 bg-gradient-to-b from-rose-50 to-rose-100/50 rounded-3xl flex items-center justify-center border border-rose-100 shadow-inner group">
                  <Trash2 className="w-8 h-8 text-rose-500 transition-transform duration-500 group-hover:rotate-12" />
                </div>
              </div>

              <div className="space-y-3">
                <AlertDialogTitle className="text-2xl font-bold tracking-tight text-zinc-900">
                  Delete Session?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-500 text-[15px] leading-relaxed">
                  This will permanently erase your study progress and analytics.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>

            <div className="mt-10 flex flex-col gap-3">
              <AlertDialogAction
                onClick={confirmDelete}
                className="w-full h-14 bg-zinc-900 hover:bg-rose-600 text-white text-[14px] font-medium rounded-2xl transition-all duration-300 shadow-lg shadow-zinc-200 hover:shadow-rose-100 border-none"
              >
                Delete Permanently
              </AlertDialogAction>

              <AlertDialogCancel className="w-full h-14 bg-transparent hover:bg-zinc-100 border-none text-zinc-500 text-[14px] font-medium rounded-2xl transition-colors">
                Keep Session
              </AlertDialogCancel>
            </div>
          </div>

          {/* Subtle footer accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-rose-100 to-transparent opacity-50" />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
