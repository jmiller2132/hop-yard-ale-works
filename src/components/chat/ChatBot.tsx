"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { answer, redactForLogging, type ChatContext, type ChatLink } from "@/lib/chatbot";
import { locationFromPath, readStoredLocation } from "@/lib/location-data";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  links?: ChatLink[];
}

interface ChatBotProps {
  faqs: ChatContext["faqs"];
  holidayOverrides: ChatContext["holidayOverrides"];
}

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "Hey — what can I help you find? Ask about hours, food, beer, events, or getting here.",
};

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function ChatBot({ faqs, holidayOverrides }: ChatBotProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: uid(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const location = locationFromPath(pathname) ?? readStoredLocation();
      const { intent, ...response } = answer(text, { location, faqs, holidayOverrides });
      if (intent === "fallback" || intent.startsWith("unposted:")) {
        track("Chatbot unanswered", {
          question: redactForLogging(text),
          topic: intent,
          page: pathname,
        });
      }
      const botMsg: Message = { id: uid(), role: "bot", ...response };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  }, [input, pathname, faqs, holidayOverrides]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat window — sits above sticky order bar on mobile */}
      {isOpen && (
        <div
          className="fixed bottom-[5.5rem] md:bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          style={{ height: "min(520px, 80vh)", backgroundColor: "white", border: "1px solid rgba(0,0,0,0.1)" }}
          role="dialog"
          aria-label="Hop Yard chat assistant"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ backgroundColor: "var(--color-ink)" }}
          >
            <div>
              <p className="font-heading font-bold text-sm text-white">Hop Yard</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Quick answers</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white text-sm hover:opacity-70 transition-opacity"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm"
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "var(--color-ink)", color: "white", borderBottomRightRadius: "4px" }
                      : { backgroundColor: "var(--color-warm-white)", color: "var(--color-ink)", borderBottomLeftRadius: "4px" }
                  }
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="inline-block rounded-full px-2.5 py-1 text-xs font-medium hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "var(--color-green-strong)", color: "white" }}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-2.5 text-sm"
                  style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-muted)", borderBottomLeftRadius: "4px" }}
                >
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something…"
              className="flex-1 rounded-full px-4 py-2 text-base sm:text-sm outline-none min-h-[40px]"
              style={{ backgroundColor: "var(--color-warm-white)", color: "var(--color-ink)" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "var(--color-seasonal-cta)", color: "white" }}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble — sits above sticky order bar on mobile */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-[4.5rem] md:bottom-4 right-4 sm:right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "var(--color-ink)",
          color: "white",
          width: "52px",
          height: "52px",
          border: "2px solid rgba(255,255,255,0.25)",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        {isOpen ? (
          <span className="text-lg leading-none">✕</span>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
