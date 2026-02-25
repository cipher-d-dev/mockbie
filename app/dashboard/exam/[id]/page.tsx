"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

// Mock questions
const mockQuestions = [
  {
    id: 1,
    text: "What is the time complexity of binary search?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: "O(log n)"
  },
  {
    id: 2,
    text: "Which data structure uses LIFO?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    answer: "Stack"
  },
  {
    id: 3,
    text: "What is the worst-case scenario for QuickSort?",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    answer: "O(n^2)"
  }
];

export default function ExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [violations, setViolations] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Cheating Detection Logic
  const logViolation = useCallback((type: string) => {
    setViolations((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${type}`]);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
    // In a real app, send this to the backend immediately
    console.log(`Violation detected: ${type}`);
  }, []);

  useEffect(() => {
    if (!user) {
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
  }, [user, router, logViolation]);

  // Timer
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
    // Send answers and violations to backend
    console.log('Exam submitted', { answers, violations });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
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

  const question = mockQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-semibold text-zinc-900">Data Structures Midterm</div>
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

      {/* Warning Toast */}
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 flex justify-between items-center text-sm text-zinc-500">
          <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
          <span>Answered: {Object.keys(answers).length} / {mockQuestions.length}</span>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => (
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
            onClick={() => setCurrentQuestion((prev) => Math.min(mockQuestions.length - 1, prev + 1))}
            disabled={currentQuestion === mockQuestions.length - 1}
          >
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}
