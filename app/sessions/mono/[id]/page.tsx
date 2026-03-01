"use client";
import React, { use, useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileUpload } from "@/components/sessions/FileUpload";
import { QuizInterface } from "@/components/sessions/QuizInterface";
import { ResultsView } from "@/components/sessions/ResultsView";
import { Spinner } from "@/components/ui/spinner";
import { sessionApi } from "@/lib/axios";
import { useParams } from "next/navigation";

export default function MonoSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameter = useParams();
  const id = parameter.id as string;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use useCallback so we can trigger this after file upload without reloading the page
  const fetchSession = useCallback(async () => {
    try {
      const res = await sessionApi.get(`/${id}`);
      setSession(res.data.session);
    } catch (err) {
      console.error("Failed to fetch session", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Wrap the entire return once.
  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      ) : !session ? (
        <p>Session not found</p>
      ) : (
        <>
          {session.status === "draft" && (
            <FileUpload
              sessionId={id}
              onComplete={fetchSession} // NO RELOAD: just re-fetch the data
            />
          )}

          {session.status === "active" && (
            <QuizInterface sessionId={id} questions={session.questions} />
          )}

          {session.status === "completed" && <ResultsView session={session} />}
        </>
      )}
    </DashboardLayout>
  );
}
