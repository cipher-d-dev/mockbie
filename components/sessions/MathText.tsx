"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function SmartText({ content }: { content: string }) {
  const processedContent = content.replace(
    /([a-zA-Z0-9_]+\.[a-zA-Z0-9._()[\]*+/-]+)/g,
    (match) => {
      return `\`${match}\``;
    },
  );
  return (
    <span
      className="prose prose-zinc max-w-none 
        prose-p:leading-relaxed 
        prose-code:bg-zinc-100 prose-code:px-1 prose-code:rounded prose-code:text-pink-600
        dark:prose-invert"
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </span>
  );
}
