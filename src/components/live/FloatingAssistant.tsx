
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, X, Bot, Minimize2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export function FloatingAssistant({ task, onUpdated }: { task: Task | null; onUpdated: (desc: string) => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! How can I help you with your current focus?",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    // Stubbed assistant response for conversational feel
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Got it. Here are a couple of quick next steps you can take. Want me to break this into a checklist?",
      };
      setMessages((m) => [...m, reply]);
      setSending(false);
    }, 450);
  };

  return (
    <>
      {/* Floating chat bubble */}
      <button
        aria-label="Open assistant chat"
        onClick={() => setOpen(true)}
        className="fixed z-40 w-14 h-14 rounded-full glass-panel elev grid place-items-center hover-scale smooth"
        style={{
          right: 'calc(env(safe-area-inset-right) + 12px)',
          bottom: 'calc(env(safe-area-inset-bottom) + 12px)'
        }}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Slide-up chat panel */}
      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground>
        <DrawerContent className="p-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)" }}>
          <DrawerHeader className="p-3 border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Assistant</DrawerTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label={minimized ? "Expand chat" : "Minimize chat"} onClick={() => setMinimized((v) => !v)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Close chat" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex flex-col" style={{ height: minimized ? "36vh" : "70vh" }}>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] md:max-w-[70%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/60 text-foreground rounded-bl-sm"
                    }`}>
                      <div className="flex items-start gap-2">
                        {m.role === "assistant" && (
                          <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-background/60 border">
                            <Bot className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <p className="whitespace-pre-line">{m.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] md:max-w-[70%] px-3 py-2 rounded-2xl text-sm bg-muted/60 text-foreground rounded-bl-sm shadow-sm">
                      <span className="opacity-70">Typing…</span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>

            {/* Input bar */}
            <div className="p-3 border-t flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything…"
                aria-label="Message input"
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || sending} aria-label="Send message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
