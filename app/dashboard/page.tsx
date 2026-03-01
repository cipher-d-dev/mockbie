"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, FileText, AlertCircle, Loader2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Highly recommended for UX
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useAuth } from "@/context/AuthContext";
import { StudyHistory } from "@/components/dashboard/StudyHistory";
import { sessionApi } from "@/lib/axios";

// Types for better maintainability
interface Exam {
  id: string;
  title: string;
  category: string;
  status: "upcoming" | "available" | "completed";
  date: string;
  duration: string;
  score?: number;
  registered?: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { student, loading: authLoading } = useAuth();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [sessions, setSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function so it can be passed to child components
  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const res = await sessionApi.get("/");
      console.log(res.data)
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to load study history", err);
      setError("We couldn't load your recent activity. Please try again later.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (student) {
      if (student.exams) setExams(student.exams);
      fetchHistory();
    }
  }, [student, fetchHistory]);

  // BEST PRACTICE: Skeleton loading for a smoother perceived performance
  const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );

  if (authLoading) return <DashboardLayout><DashboardSkeleton /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header Section */}
        <header>
          <h1 className="text-2xl font-black font-inter tracking-tight text-zinc-900">
            Student Dashboard
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Welcome back, {student?.fullName || "Scholar"}. Here is your progress.
          </p>
        </header>

        {/* Exams Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-800">My Registered Exams</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length > 0 ? (
              exams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{exam.title}</CardTitle>
                          <CardDescription>{exam.category}</CardDescription>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          exam.status === "upcoming" ? "bg-blue-50 text-blue-600" :
                          exam.status === "available" ? "bg-emerald-50 text-emerald-600" :
                          "bg-zinc-100 text-zinc-600"
                        }`}>
                          {exam.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-zinc-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {exam.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {exam.duration}
                      </div>
                      {exam.score && (
                        <div className="flex items-center gap-2 text-zinc-900 font-bold pt-2">
                          <FileText className="w-4 h-4 text-emerald-500" /> Score: {exam.score}%
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant={exam.status === "available" ? "default" : "secondary"} 
                        className="w-full font-bold"
                        onClick={() => exam.status === "upcoming" && router.push(`/dashboard/exam/${exam.id}`)}
                      >
                        {exam.status === "completed" ? "Review Content" : "Enter Exam"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-2xl border-zinc-100">
                <p className="text-zinc-400 font-medium">No exams found for your account.</p>
              </div>
            )}
          </div>
        </section>

        {/* Study History Section */}
        <section className="space-y-6 pt-4">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12 bg-zinc-50/50 rounded-3xl border border-zinc-100">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-300 mb-2" />
              <p className="text-zinc-400 text-sm font-medium">Fetching your history...</p>
            </div>
          ) : (
            <StudyHistory 
              sessions={sessions} 
              onRefresh={fetchHistory} // Allows the component to update the parent state
            />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}