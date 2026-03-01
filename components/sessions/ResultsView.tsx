"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  ChevronRight,
  Target,
  Trophy,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { SmartText } from "./MathText";

interface ResultsViewProps {
  session: any;
}

export function ResultsView({ session }: ResultsViewProps) {
  const router = useRouter();
  const results = session?.results || {
    percentage: 0,
    score: 0,
    totalQuestions: 0,
    answers: [],
  };
  const questions = session?.questions || [];
  const isHighScorer = results.percentage >= 70;
  // SVG Circle Constants
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (results.percentage / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-12 font-inter">
      {/* 1. Hero Centered Score Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center space-y-6"
      >
        <div className="relative flex items-center justify-center">
          {/* SVG Progress Circle */}
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-zinc-100 fill-none"
              strokeWidth="8"
            />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              className={`fill-none transition-all duration-1000 ${isHighScorer ? "stroke-emerald-500" : "stroke-zinc-900"}`}
              strokeWidth="8"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-zinc-900">
              {results.percentage}%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
              Accuracy
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
            {isHighScorer ? "Mastery Achieved!" : "Keep Pushing!"}
          </h1>
          <div className="flex items-center justify-center gap-6 text-zinc-500 font-medium">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> {results.score}{" "}
              Correct
            </span>
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />{" "}
              {results.totalQuestions - results.score} Missed
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="rounded-2xl h-12 px-8 bg-zinc-900 hover:bg-black font-bold shadow-lg shadow-zinc-200"
          >
            <RotateCcw className="mr-2 w-4 h-4" /> Retake
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl h-12 px-8 border-zinc-200 font-bold hover:bg-zinc-50"
          >
            <Home className="mr-2 w-4 h-4" /> Home
          </Button>
        </div>
      </motion.div>

      {/* 2. Review Section Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Detailed Review
          </h3>
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            {questions.length} Concepts Analyzed
          </span>
        </div>

        <div className="grid gap-6">
          {questions.map((q: any, idx: number) => {
            const userAnswer = results.answers?.[idx];
            const isCorrect = userAnswer?.isCorrect;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={`border-none shadow-sm overflow-hidden ${isCorrect ? "bg-white" : "bg-rose-50/30"}`}
                >
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    {/* Status Indicator Bar */}
                    <div
                      className={`w-1.5 ${isCorrect ? "bg-emerald-500" : "bg-rose-500"}`}
                    />

                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-zinc-900 leading-snug">
                          <SmartText content={q.questionText} />
                        </h4>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                          <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">
                            Correct Answer
                          </p>
                          <div className="text-sm font-bold text-emerald-700">
                            <SmartText content={q.correctAnswer} />
                          </div>
                        </div>

                        {!isCorrect && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                            <p className="text-[10px] font-black text-rose-400 uppercase mb-1">
                              Your Selection
                            </p>
                            <p className="text-sm font-bold text-rose-700">
                              <SmartText
                                content={
                                  userAnswer?.selectedOption || "No Answer"
                                }
                              />
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-zinc-900 text-zinc-300 rounded-xl text-xs leading-relaxed italic border-l-4 border-zinc-500">
                        <p className="font-bold text-white mb-1 not-italic">
                          Why this is correct:
                        </p>
                        <SmartText content={q.explanation} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
