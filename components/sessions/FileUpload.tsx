"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { sessionApi } from "@/lib/axios";
import { Progress } from "@/components/ui/progress"; 
import { useRouter } from "next/router";

interface FileUploadProps {
  sessionId: string;
  onComplete: (questions: any[]) => void;
}

export function FileUpload({ sessionId, onComplete }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("pdf", file);

      try {
        setIsProcessing(true);
        const response = await sessionApi.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500"}/api/sessions/${sessionId}/process`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 100),
              );
              setUploadProgress(percentCompleted);
            },
          },
        );

        if (response.data.success) {
          onComplete(response.data.questions);
        }
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId, onComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4
          ${isDragActive ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-zinc-300"}
          ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="p-4 bg-zinc-100 rounded-full">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-zinc-500" />
          )}
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold font-inter">
            {isProcessing
              ? "Analyzing your PDF..."
              : "Drop your lecture notes here"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            PDF files only (Max 10MB)
          </p>
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>
              {uploadProgress < 100 ? "Uploading" : "Gemini is Thinking"}
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}
