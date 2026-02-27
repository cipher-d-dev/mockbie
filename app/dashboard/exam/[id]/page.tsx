"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export default function ExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [violations, setViolations] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Get exam from user's exams array
  const exam = user?.exams?.find((exam: any) => exam.id === id);
  const questions = exam?.questions || [];

  const logViolation = useCallback((type: string) => {
    setViolations((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${type}`]);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
    console.log(`Violation detected: ${type}`);
  }, []);

  useEffect(() => {
    if (!user || !exam) {
      router.push('/');
      return;
    }

    const handleBlur = () => logViolation('Window lost focus (Tab switch/minimize)');
    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); logViolation('Copy attempt'); };
    const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); logViolation('Paste attempt'); };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); logViolation('Right-click attempt'); };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [user, exam, router, logViolation]);

  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option: string) => {
    setAnswers({ ...answers, [currentQuestion]: option });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    console.log('Exam submitted', { answers, violations });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen font-inter bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Exam Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-500">Your answers have been successfully recorded.</p>
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen font-inter bg-zinc-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Exam not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen font-inter bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-semibold text-zinc-900">{exam.title}</div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-zinc-900'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <Button variant="destructive" size="sm" onClick={handleSubmit}>
              Submit Exam
            </Button>
          </div>
        </div>
      </header>

      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Warning: Suspicious activity detected. This has been logged.</span>
        </motion.div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 flex justify-between items-center text-sm text-zinc-500">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>Answered: {Object.keys(answers).length} / {questions.length}</span>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  answers[currentQuestion] === option
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    answers[currentQuestion] === option ? 'border-zinc-900' : 'border-zinc-300'
                  }`}>
                    {answers[currentQuestion] === option && <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />}
                  </div>
                  <span className="text-zinc-900">{option}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQuestion === questions.length - 1}
          >
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}
