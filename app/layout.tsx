import type { Metadata } from "next";
import "./globals.css"; // Global styles
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Mockbie - AI-Powered Exam Proctoring",
  description:
    "Mockbie is an AI-powered exam proctoring solution designed to ensure academic integrity during online exams. With features like real-time monitoring, behavior analysis, and secure browser lockdown, Mockbie provides a seamless and secure testing environment for students and educators alike.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
