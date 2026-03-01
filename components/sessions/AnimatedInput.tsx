"use client";

import { useState, useEffect } from "react";

export function AnimatedInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const strings = [
    "What are we studying today?",
    "Molecular Biology Quiz...",
    "Finals Week Prep...",
    "Name your session...",
  ];

  useEffect(() => {
    const currentString = strings[loopNum % strings.length];
    const speed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentString.substring(0, displayText.length + 1));
        if (displayText === currentString) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setDisplayText(currentString.substring(0, displayText.length - 1));
        if (displayText === "") {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, loopNum]);

  return (
    <div className="relative w-full group">
      {/* 1. The Real Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="relative z-10 w-full text-2xl md:text-4xl font-medium tracking-tight text-zinc-900 bg-transparent focus:outline-none transition-all"
      />

      {/* 2. The Animated Placeholder Layer (Only shows if input is empty) */}
      {!value && (
        <div
          className="absolute inset-0 z-0 flex items-center pointer-events-none text-zinc-300 text-2xl md:text-4xl font-medium tracking-tight
                     after:content-[''] after:ml-1 after:w-[3px] after:h-[1em] after:bg-zinc-300 after:animate-pulse"
        >
          {displayText}
        </div>
      )}

      {/* 3. The "Focus" Underline using before: */}
      <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-zinc-500 transition-all duration-500 group-focus-within:w-full" />
    </div>
  );
}
