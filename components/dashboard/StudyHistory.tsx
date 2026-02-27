// components/dashboard/StudyHistory.tsx
export function StudyHistory({ sessions }: { sessions: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold font-inter">Recent Sessions</h3>
      <div className="grid gap-3">
        {sessions.map((session) => (
          <div
            key={session._id}
            className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all"
          >
            <div>
              <p className="font-semibold">{session.title}</p>
              <p className="text-xs text-zinc-400">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-sm font-bold ${session.results?.percentage >= 70 ? "text-emerald-500" : "text-zinc-500"}`}
              >
                {session.results?.percentage || 0}%
              </span>
              <p className="text-[10px] uppercase font-black text-zinc-300">
                Score
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
