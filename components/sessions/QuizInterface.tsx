"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { sessionApi } from "@/lib/axios";
import { Bounce, toast } from "react-toastify";
import { SmartText } from "./MathText";

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface UserAnswerRecord {
  questionText: string;
  selectedOption: string;
  isCorrect: boolean;
}

export function QuizInterface({
  questions,
  sessionId,
}: {
  questions: Question[];
  sessionId: string;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  // Calculate real-time score from the userAnswers array ONLY
  const score = userAnswers.filter((a) => a.isCorrect).length;

  const handleAnswerSelect = (option: string) => {
    if (isReviewed) return;
    setSelectedAnswer(option);
  };

  const handleConfirm = () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnswer: UserAnswerRecord = {
      questionText: currentQuestion.questionText,
      selectedOption: selectedAnswer || "Skipped",
      isCorrect: isCorrect,
    };
    setUserAnswers((prev) => [...prev, newAnswer]);
    setIsReviewed(true);
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsReviewed(false);
    } else {
      submitFinalResults();
    }
  };

  const submitFinalResults = async () => {
    try {
      setIsSubmitting(true);
      const finalScore = userAnswers.filter((a) => a.isCorrect).length;

      await sessionApi.post(`/${sessionId}/submit`, {
        score: finalScore,
        totalQuestions: questions.length,
        percentage: Math.round((finalScore / questions.length) * 100),
        answers: userAnswers, // Matching your ResultsView key
      });
      setIsFinished(true);
    } catch (err) {
      toast.error("Could not save results. Showing summary locally.");
      setIsFinished(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) window.location.reload(); // Trigger re-fetch of session for ResultsView

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-inter pb-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
              Current Progress
            </span>
            <p className="text-xl font-bold text-zinc-900">
              Question {currentIdx + 1}
              <span className="text-zinc-300 mx-1">/</span>
              {questions.length}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">
              Score
            </span>
            <p className="text-xl font-bold text-emerald-600">{score} pts</p>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 bg-zinc-100" />
      </div>

      {/* Question Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-none shadow-2xl shadow-zinc-200/50 bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <h2 className="text-[1.25rem] font-bold font-inter text-zinc-900 leading-tight tracking-tight">
                <SmartText content={currentQuestion.questionText} />
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const isSelected = option === selectedAnswer;

                  let style =
                    "border-zinc-100 bg-zinc-50/50 hover:border-zinc-300";
                  if (isReviewed && isCorrect)
                    style =
                      "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500";
                  if (isReviewed && isSelected && !isCorrect)
                    style =
                      "border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500";
                  if (!isReviewed && isSelected)
                    style =
                      "border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-200";

                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      disabled={isReviewed}
                      onClick={() => handleAnswerSelect(option)}
                      className={`group flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all font-medium ${style}`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border ${isSelected ? "bg-white/20 border-white/20" : "bg-white border-zinc-200 text-zinc-400"}`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <SmartText content={option} />
                      </div>
                      {isReviewed && isCorrect && <Check className="w-5 h-5" />}
                      {isReviewed && isSelected && !isCorrect && (
                        <X className="w-5 h-5" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Enhanced Feedback Section */}
              <AnimatePresence>
                {isReviewed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-4">
                      <div className="mt-1 p-1.5 bg-white rounded-lg shadow-sm h-fit">
                        <Info className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                          Logic & Explanation
                        </p>
                        <div className="text-zinc-600 leading-relaxed text-sm italic">
                          <SmartText content={currentQuestion.explanation} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Fixed Footer Action */}
      <div className="flex justify-end pt-4">
        {!isReviewed ? (
          <Button
            disabled={!selectedAnswer}
            onClick={handleConfirm}
            size="lg"
            className="rounded-2xl px-10 h-14 bg-zinc-900 hover:bg-black text-white shadow-xl shadow-zinc-200 transition-all font-bold"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            size="lg"
            className="rounded-2xl px-10 h-14 bg-zinc-900 hover:bg-black text-white shadow-xl shadow-zinc-200 transition-all font-bold group"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : currentIdx === questions.length - 1 ? (
              "Complete Session"
            ) : (
              "Next Question"
            )}
            {!isSubmitting && (
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
