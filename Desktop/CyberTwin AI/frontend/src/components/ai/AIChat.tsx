"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { aiApi } from "@/lib/api";
import type { ChatMessage, AttackType } from "@/types";
import { ATTACK_LABELS } from "@/types";

const QUICK_PROMPTS = [
  "Explain the current attack",
  "How do I stop this threat?",
  "Predict attack propagation",
  "Generate incident report",
  "What nodes are at risk?",
];

interface AIChatProps {
  currentAttackType?: AttackType | null;
  compromisedNodes?: string[];
  threatScore?: number;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-cyber-cyan/10 border border-cyber-cyan/30"
            : "bg-cyber-purple/10 border border-cyber-purple/30"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-cyber-cyan" />
        ) : (
          <Bot className="w-4 h-4 text-cyber-purple" />
        )}
      </div>

      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-cyber-cyan/10 text-cyber-text border border-cyber-cyan/20 rounded-tr-sm"
            : "bg-cyber-panel text-cyber-text border border-cyber-border rounded-tl-sm"
        }`}
      >
        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{msg.content}</pre>
        <p className="text-xs text-cyber-text-dim mt-1 text-right font-mono">
          {msg.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}

export default function AIChat({
  currentAttackType,
  compromisedNodes = [],
  threatScore = 0,
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `CyberTwin AI Analyst online.

I'm your AI-powered cybersecurity analyst. I can help you:
• Analyze active threats and attack patterns
• Explain MITRE ATT&CK techniques
• Generate mitigation recommendations
• Predict attack propagation paths
• Create incident summaries

${currentAttackType ? `Active threat detected: **${ATTACK_LABELS[currentAttackType]}**` : "No active simulation. Launch an attack to begin analysis."}

How can I assist you?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || thinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const response = await aiApi.chat(
        text,
        {
          attack_type: currentAttackType || "unknown",
          compromised_nodes: compromisedNodes,
          threat_score: threatScore,
        },
        messages.slice(-6)
      );

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "AI analysis engine unavailable. Please ensure the backend service is running with Ollama configured.\n\nYou can still use the simulation and monitoring features.",
        timestamp: new Date(),
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyber-border">
        <div className="w-8 h-8 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyber-purple" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-cyber-text">AI Security Analyst</h2>
          <p className="text-xs text-cyber-text-dim">
            Powered by {currentAttackType ? `context-aware analysis` : "CyberTwin AI"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="text-xs text-cyber-green terminal-text">ONLINE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-cyber-text-dim"
          >
            <div className="w-7 h-7 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyber-purple" />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-cyber-purple"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={thinking}
            className="text-xs px-2.5 py-1 rounded-full border border-cyber-border text-cyber-text-dim hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about the threat..."
          disabled={thinking}
          className="flex-1 bg-white/5 border border-cyber-border rounded-lg px-3 py-2 text-sm text-cyber-text placeholder:text-cyber-text-dim focus:outline-none focus:border-cyber-cyan/50 transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || thinking}
          className="w-9 h-9 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan hover:bg-cyber-cyan/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {thinking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
