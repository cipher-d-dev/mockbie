"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { Users, FileText, AlertTriangle, Plus, Upload } from 'lucide-react';
import { useState } from 'react';

export default function AdminDashboard() {
  const [isUploading, setIsUploading] = useState(false);

  const stats = [
    { title: 'Total Students', value: '1,245', icon: Users, color: 'text-blue-500' },
    { title: 'Active Exams', value: '12', icon: FileText, color: 'text-green-500' },
    { title: 'Violations Today', value: '24', icon: AlertTriangle, color: 'text-red-500' },
  ];

  const recentExams = [
    { id: 1, title: 'Data Structures Midterm', category: 'Computer Science', date: '2026-03-01', participants: 85 },
    { id: 2, title: 'Algorithms Final', category: 'Computer Science', date: '2026-03-15', participants: 120 },
  ];

  const recentViolations = [
    { id: 1, student: 'John Doe', matric: '12345678', type: 'Tab Switch', time: '10:45 AM', exam: 'Data Structures' },
    { id: 2, student: 'Jane Smith', matric: '87654321', type: 'Copy/Paste', time: '11:12 AM', exam: 'Algorithms' },
  ];

  const handleUploadPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload and Gemini processing
    setTimeout(() => {
      setIsUploading(false);
      alert('Questions generated successfully from PDF!');
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Dashboard</h1>
            <p className="text-zinc-500 mt-2">Manage exams, monitor students, and review violations.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => document.getElementById('pdf-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Processing...' : 'Generate from PDF'}
            </Button>
            <input type="file" id="pdf-upload" className="hidden" accept=".pdf" onChange={handleUploadPDF} />
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="exams" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Exams</CardTitle>
                <CardDescription>Manage your currently active and upcoming exams.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-zinc-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                      <tr>
                        <th className="px-6 py-3 font-medium">Title</th>
                        <th className="px-6 py-3 font-medium">Category</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Participants</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExams.map((exam) => (
                        <tr key={exam.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50">
                          <td className="px-6 py-4 font-medium text-zinc-900">{exam.title}</td>
                          <td className="px-6 py-4 text-zinc-500">{exam.category}</td>
                          <td className="px-6 py-4 text-zinc-500">{exam.date}</td>
                          <td className="px-6 py-4 text-zinc-500">{exam.participants} / 100</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registered Students</CardTitle>
                <CardDescription>View and manage student accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-zinc-500">Student list will appear here.</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Violations</CardTitle>
                <CardDescription>Review flagged activities from recent exams.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-zinc-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                      <tr>
                        <th className="px-6 py-3 font-medium">Student</th>
                        <th className="px-6 py-3 font-medium">Matric No.</th>
                        <th className="px-6 py-3 font-medium">Exam</th>
                        <th className="px-6 py-3 font-medium">Violation Type</th>
                        <th className="px-6 py-3 font-medium">Time</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentViolations.map((violation) => (
                        <tr key={violation.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50">
                          <td className="px-6 py-4 font-medium text-zinc-900">{violation.student}</td>
                          <td className="px-6 py-4 text-zinc-500">{violation.matric}</td>
                          <td className="px-6 py-4 text-zinc-500">{violation.exam}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              {violation.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500">{violation.time}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">Review</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
