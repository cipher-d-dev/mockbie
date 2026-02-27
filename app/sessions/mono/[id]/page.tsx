"use client";
import { FileUpload } from "@/components/sessions/FileUpload";
import { QuizInterface } from "@/components/sessions/QuizInterface";
import { ResultsView } from "@/components/sessions/ResultsView";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { use, useEffect, useState } from "react";

export default function MonoSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the session using your router.get("/:id") route
    const fetchSession = async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500"}/api/sessions/${params.id}`);
      setSession(res.data.session);
      setLoading(false);
    };
    fetchSession();
  }, [params.id]);

  if (loading) return <Spinner />;

  // Determine what to show based on backend status
  if (session.status === "draft") {
    return (
      <FileUpload
        sessionId={params.id}
        onComplete={() => window.location.reload()}
      />
    );
  }

  if (session.status === "active") {
    return (
      <QuizInterface sessionId={params.id} questions={session.questions} />
    );
  }

  return <ResultsView session={session} />;
}
