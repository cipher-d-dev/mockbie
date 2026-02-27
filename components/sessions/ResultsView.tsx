"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ResultsViewProps {
  session: any; // The session object from your GET /:id route
}

export function ResultsView({ session }: ResultsViewProps) {
  const { results, questions } = session;
  const isHighScorer = results.percentage >= 70;

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10 font-inter">
      {/* 1. Hero Score Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${isHighScorer ? "border-emerald-500 bg-emerald-50" : "border-zinc-200 bg-zinc-50"}`}
        >
          <span className="text-3xl font-black">{results.percentage}%</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          {isHighScorer ? "Excellent Work!" : "Keep Practicing!"}
        </h1>
        <p className="text-zinc-500 text-lg">
          You scored{" "}
          <span className="font-bold text-zinc-900">{results.score}</span> out
          of{" "}
          <span className="font-bold text-zinc-900">
            {results.totalQuestions}
          </span>{" "}
          questions correctly.
        </p>
      </motion.div>

      {/* 2. Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          className="rounded-full px-6"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="mr-2 w-4 h-4" /> Retake Quiz
        </Button>
        <Button
          className="rounded-full px-6"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <Home className="mr-2 w-4 h-4" /> Dashboard
        </Button>
      </div>

      {/* 3. Detailed Review Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Review Answers <ChevronRight className="w-5 h-5" />
        </h3>

        <div className="grid gap-4">
          {questions.map((q: any, idx: number) => (
            <Card key={idx} className="border-none shadow-sm bg-zinc-50/50">
              <CardContent className="p-6 flex gap-4">
                <div className="mt-1">
                  {results.answers[idx]?.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-zinc-800">
                    {q.questionText}
                  </p>
                  <p className="text-sm">
                    <span className="text-zinc-400 font-medium">Correct: </span>
                    <span className="text-emerald-600 font-bold">
                      {q.correctAnswer}
                    </span>
                  </p>
                  {!results.answers[idx]?.isCorrect && (
                    <p className="text-sm">
                      <span className="text-zinc-400 font-medium">
                        Your answer:{" "}
                      </span>
                      <span className="text-rose-600 font-bold">
                        {results.answers[idx]?.userAnswer || "Skipped"}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 italic bg-white p-3 rounded-lg border border-zinc-100 mt-2">
                    {q.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
