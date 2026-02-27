"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { sessionApi } from "@/lib/axios";
import { Bounce, toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function QuizInterface({ questions, sessionId }: { questions: Question[]; sessionId: string  }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const { error } = useAuth();

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "font-inter!important",
        draggable: true,
        theme: "dark",
        transition: Bounce,
        style: customToastStyle,
      });
    }
  }, [error]);

  const customToastStyle = {
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
  };

  const handleAnswerSelect = (option: string) => {
    if (isReviewed) return;
    setSelectedAnswer(option);
  };

  const handleConfirm = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore((s) => s + 1);
    }
    setIsReviewed(true);
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsReviewed(false);
    } else {
      // Save to Backend before showing Result screen
      try {
        await sessionApi.post(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500"}/api/sessions/${sessionId}/submit`, {
          score:
            selectedAnswer === currentQuestion.correctAnswer
              ? score + 1
              : score,
          totalQuestions: questions.length,
          // Optional: map your answers array here
        });
        setIsFinished(true);
      } catch (err) {
        toast.error("Study results for this session were not saved.", {
          style: customToastStyle,
        });
        setIsFinished(true); // Still show result to user
      }
    }
  };

  if (isFinished) return <QuizResult score={score} total={questions.length} />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-inter">
      {/* Header & Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-end text-sm">
          <span className="font-semibold text-zinc-500 uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="font-bold text-lg">{score} pts</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-bold leading-tight">
                {currentQuestion.questionText}
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const isSelected = option === selectedAnswer;

                  let variant = "border-zinc-100 hover:border-primary/50";
                  if (isReviewed && isCorrect)
                    variant =
                      "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500";
                  if (isReviewed && isSelected && !isCorrect)
                    variant =
                      "border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500";
                  if (!isReviewed && isSelected)
                    variant = "border-primary bg-primary/5 ring-1 ring-primary";

                  return (
                    <button
                      key={option}
                      disabled={isReviewed}
                      onClick={() => handleAnswerSelect(option)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all font-medium ${variant}`}
                    >
                      {option}
                      {isReviewed && isCorrect && <Check className="w-5 h-5" />}
                      {isReviewed && isSelected && !isCorrect && (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Section */}
              {isReviewed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="pt-6 border-t border-zinc-100"
                >
                  <p className="text-sm font-bold text-zinc-500 uppercase mb-2">
                    Explanation
                  </p>
                  <p className="text-zinc-600 leading-relaxed italic">
                    "{currentQuestion.explanation}"
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        {!isReviewed ? (
          <Button
            disabled={!selectedAnswer}
            onClick={handleConfirm}
            size="lg"
            className="rounded-full px-8"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            size="lg"
            className="rounded-full px-8 group"
          >
            {currentIdx === questions.length - 1 ? "Finish" : "Next Question"}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizResult({ score, total }: { score: number; total: number }) {
  const percentage = Math.round((score / total) * 100);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center space-y-6 py-12"
    >
      <div className="relative inline-block">
        <div className="text-7xl font-black">{percentage}%</div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2">
          Final Score
        </p>
      </div>
      <p className="text-lg text-zinc-600">
        You got {score} out of {total} questions correct!
      </p>
      <div className="flex gap-4 justify-center pt-8">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="mr-2 w-4 h-4" /> Try Again
        </Button>
        <Button
          className="rounded-full"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <Home className="mr-2 w-4 h-4" /> Back Home
        </Button>
      </div>
    </motion.div>
  );
}
