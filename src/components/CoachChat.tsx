"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { sendCoachMessage } from "@/app/(app)/coach/actions";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "How do I land a research experience?",
  "How can I raise my Pathway Score?",
  "Plan my junior year",
  "Give me a passion project idea",
];

export function CoachChat({
  initial,
  studentName,
}: {
  initial: Msg[];
  studentName: string;
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || thinking) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: clean }]);
    setThinking(true);
    const res = await sendCoachMessage(clean);
    setThinking(false);
    setMessages((m) => [
      ...m,
      { role: "assistant", content: res.ok ? res.reply! : res.error || "Something went wrong." },
    ]);
  }

  return (
    <div className="card flex h-[calc(100vh-160px)] flex-col overflow-hidden">
      {/* Thread */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-[440px] pt-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-ai-bg">
              <Icon id="coach" size={22} color="#7c3aed" />
            </div>
            <h3 className="mt-4 text-[17px] font-extrabold">Hi {studentName.split(" ")[0]}, I'm your Pathway Coach</h3>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              Ask me anything about your strategy, essays, activities, or next steps.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="mr-2.5 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai-bg">
                <Icon id="coach" size={16} color="#7c3aed" />
              </div>
            )}
            <div
              className="max-w-[76%] whitespace-pre-wrap rounded-hero px-4 py-2.5 text-[14px] leading-relaxed"
              style={
                m.role === "user"
                  ? { background: "#4f46e5", color: "#fff", borderBottomRightRadius: 6 }
                  : { background: "#f5f4f1", color: "#2c313a", borderBottomLeftRadius: 6 }
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="mr-2.5 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai-bg">
              <Icon id="coach" size={16} color="#7c3aed" />
            </div>
            <div className="rounded-hero bg-[#f5f4f1] px-4 py-3" style={{ borderBottomLeftRadius: 6 }}>
              <div className="flex gap-1">
                <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length < 2 && (
        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-pill border border-border-input2 bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-3 transition hover:bg-app"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your Coach…"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-btn bg-accent text-white transition hover:bg-accent-hover disabled:opacity-50"
          aria-label="Send"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-ink-subtle"
      style={{ animation: "pw-fade .6s ease-in-out infinite alternate", animationDelay: `${delay}s` }}
    />
  );
}
