"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Flame,
  ArrowRight,
  UploadCloud,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";
import { sessionApi } from "@/lib/axios";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TypingEffect from "react-typed.ts";
import { AnimatedInput } from "./AnimatedInput";

export function FileUpload({
  sessionId,
  onComplete,
}: {
  sessionId: string;
  onComplete: (q: any[]) => void;
}) {
  const [sessionName, setSessionName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [focusArea, setFocusArea] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const handleStartProcessing = async () => {
    if (!file || !sessionName.trim()) {
      toast.error("Please name your session and upload a document.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", sessionName);
    formData.append("difficulty", difficulty);
    formData.append("focusArea", focusArea || "General Overview");

    try {
      setIsProcessing(true);
      const res = await sessionApi.post(`/${sessionId}/process`, formData, {
        onUploadProgress: (e) =>
          setUploadProgress(Math.round((e.loaded * 100) / (e.total || 100))),
      });
      if (res.data.success) onComplete(res.data.questions);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isProcessing,
  });

  const difficulties = [
    {
      id: "easy",
      label: "Fundamental",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "medium",
      label: "Standard",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      id: "hard",
      label: "Advanced",
      icon: Flame,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
      >
        <div className="p-8 md:p-12 space-y-12">
          {/* Header & Hero Input */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              New Workspace
            </div>

            <AnimatedInput value={sessionName} onChange={setSessionName} />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Left Column: Configuration */}
            <div className="space-y-8">
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Academic Rigor
                </label>
                <div className="flex flex-col gap-3">
                  {difficulties.map((lvl) => {
                    const isActive = difficulty === lvl.id;
                    return (
                      <motion.button
                        key={lvl.id}
                        whileHover={{ scale: isActive ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDifficulty(lvl.id)}
                        className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                          isActive
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                            : "border-transparent bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl ${isActive ? "bg-white/10" : lvl.bg}`}
                        >
                          <lvl.icon
                            className={`w-5 h-5 ${isActive ? "text-white" : lvl.color}`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{lvl.label}</p>
                          <p
                            className={`text-xs mt-0.5 ${isActive ? "text-zinc-400" : "text-zinc-500"}`}
                          >
                            {lvl.id === "easy" && "Core concepts & basics"}
                            {lvl.id === "medium" && "Standard exam difficulty"}
                            {lvl.id === "hard" && "Deep reasoning / analysis"}
                          </p>
                        </div>
                        {isActive && (
                          <CheckCircle2 className="w-5 h-5 ml-auto text-white opacity-50" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Target Focus (Optional)
                </label>
                <Input
                  placeholder="e.g., Focus only on Chapters 3 & 4"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="h-14 bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-300 rounded-2xl text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Right Column: Upload & Action */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Source Material
                </label>

                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      {...getRootProps()}
                      className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer h-[280px] ${
                        isDragActive
                          ? "border-amber-500 bg-amber-50/50"
                          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div
                        className={`p-4 rounded-full transition-transform ${isDragActive ? "scale-110 bg-amber-100 text-amber-600" : "bg-white text-zinc-400 shadow-sm"}`}
                      >
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-zinc-700">
                          Drop PDF document here
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">
                          Max file size 10MB
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="file-card"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 border-emerald-500/20 bg-emerald-50/30 h-[280px]"
                    >
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="p-2 bg-white rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="text-center space-y-1 max-w-[200px]">
                        <p className="text-sm font-bold text-zinc-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                          Ready to process
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Area */}
              <div className="pt-4">
                {isProcessing ? (
                  <div className="space-y-4 p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        <span className="text-xs font-black text-zinc-900 uppercase tracking-widest">
                          {uploadProgress < 100
                            ? "Uploading..."
                            : "Synthesizing..."}
                        </span>
                      </div>
                      <span className="text-xs font-black text-zinc-900">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-2 bg-zinc-200"
                    />
                  </div>
                ) : (
                  <Button
                    onClick={handleStartProcessing}
                    disabled={!file || !sessionName.trim()}
                    className="w-full h-16 rounded-[5rem] bg-zinc-900 hover:bg-black text-white font-medium text-[14px] shadow-xl shadow-zinc-200 transition-all hover:-translate-y-1 disabled:hover:translate-y-0 group"
                  >
                    Generate Study Session
                    <ArrowRight className="w-5 h-5 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="bg-zinc-50 px-8 py-5 border-t border-zinc-100 flex items-start gap-3">
          <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
            Our AI engine analyzes your document to create a custom evaluation.
            While highly accurate, always cross-reference critical medical or
            scientific data with primary textbooks.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
