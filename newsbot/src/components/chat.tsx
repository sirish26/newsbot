import { useState, useRef, useEffect } from "react";
import Message from "./message";
import type { Msg } from "../types";

const welcomeMessage: Msg = {
  id: crypto.randomUUID(),
  sender: "bot",
  text: "Welcome to the chat! Ask me anything about the news.",
};

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const id = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentChatId = localStorage.getItem("current_chat");
    if (currentChatId) {
      id.current = currentChatId;
      const savedMsgs = localStorage.getItem(`chat_${currentChatId}`);
      if (savedMsgs) {
        const parsedMsgs = JSON.parse(savedMsgs);
        if (parsedMsgs.length > 0) {
          setMsgs(parsedMsgs);
        } else {
          setMsgs([welcomeMessage]);
        }
      } else {
        setMsgs([welcomeMessage]);
      }
    } else {
      const newId = crypto.randomUUID();
      id.current = newId;
      localStorage.setItem("current_chat", newId);
      setMsgs([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    if (id.current) {
      localStorage.setItem(`chat_${id.current}`, JSON.stringify(msgs));
    }
  }, [msgs]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [msgs]);

  async function send() {
    if (!input.trim()) return;

    const userMsg: Msg = { id: crypto.randomUUID(), sender: "user", text: input };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, id: id.current }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let botMsg: Msg = { id: crypto.randomUUID(), sender: "bot", text: "" };
    setMsgs((m) => [...m, botMsg]);

    if (reader) {
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const jsonStr = line.replace(/^data:\s*/, "");
            try {
              const obj = JSON.parse(jsonStr);
              if (obj.chunk) {
                botMsg.text += obj.chunk;
                setMsgs((m) =>
                  m.map((msg) => (msg.id === botMsg.id ? { ...botMsg } : msg))
                );
              }
            } catch (e) {
              console.error("JSON parse error", e, jsonStr);
            }
          }
        }
      }
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <div className="chat-container">
      <div className="chat-main">
        <div className="chat-body" ref={chatBodyRef}>
          {msgs.map((m) => (
            <Message key={m.id} msg={m} />
          ))}
          {loading && <div className="bot-typing">...</div>}
        </div>
        <div className="chat-footer">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about news"
          />
          <button onClick={send} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
