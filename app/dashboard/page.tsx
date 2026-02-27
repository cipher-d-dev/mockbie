"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

interface Exam {
  id: string;
  title: string;
  category: string;
  status: 'upcoming' | 'available' | 'completed';
  date: string;
  duration: string;
  score?: number;
  registered?: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { student, loading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (student?.exams) {
      setExams(student.exams);
    }
  }, [student]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold font-inter tracking-tight text-zinc-900">My Exams</h1>
          <p className="text-zinc-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-inter tracking-tight text-zinc-900">My Exams</h1>
          <p className="text-zinc-500 mt-2">View and manage your upcoming and past exams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle>{exam.title}</CardTitle>
                      <CardDescription>{exam.category}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      exam.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      exam.status === 'available' ? 'bg-green-100 text-green-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center text-sm text-zinc-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {exam.date}
                  </div>
                  <div className="flex items-center text-sm text-zinc-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {exam.duration}
                  </div>
                  {exam.score && (
                    <div className="flex items-center text-sm font-medium text-zinc-900">
                      <FileText className="w-4 h-4 mr-2" />
                      Score: {exam.score}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {exam.status === 'upcoming' && exam.registered && (
                    <Button className="w-full" onClick={() => router.push(`/dashboard/exam/${exam.id}`)}>
                      Enter Exam
                    </Button>
                  )}
                  {exam.status === 'available' && !exam.registered && (
                    <Button variant="outline" className="w-full">
                      Register Now
                    </Button>
                  )}
                  {exam.status === 'completed' && (
                    <Button variant="secondary" className="w-full">
                      View Results
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
