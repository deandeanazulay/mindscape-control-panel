
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { MessageSquare } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
};

export function FloatingAssistant({ task, onUpdated }: { task: Task | null; onUpdated: (desc: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [attach, setAttach] = useState(true);
  const { user } = useSupabaseAuth();

  const submit = async () => {
    if (!attach) {
      setOpen(false);
      setText("");
      toast({ title: "Noted", description: "Message sent to assistant (stubbed)." });
      return;
    }
    if (!task) {
      toast({ title: "No task selected", description: "Pick an active roadmap and task first." });
      return;
    }
    if (!user) {
      toast({ title: "Sign in required", description: "Connect Supabase to attach advice to tasks." });
      return;
    }
    const stamp = new Date().toLocaleString();
    const newDesc =
      (task.description ?? "") + `\n\n[AI advice ${stamp}]\n${text.trim()}`;

    const { error } = await supabase
      .from("tasks")
      .update({ description: newDesc })
      .eq("id", task.id)
      .eq("user_id", user.id);
    if (error) {
      console.error(error);
      return;
    }
    onUpdated(newDesc);
    setOpen(false);
    setText("");
    toast({ title: "Attached to task", description: "Advice appended to task notes." });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open AI assistant"
            className="fixed z-30 bottom-24 right-4 w-12 h-12 rounded-full glass-panel elev grid place-items-center hover:scale-105 smooth"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>AI Assistant</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-3">
            <div className="text-sm text-muted-foreground">
              Ask for advice, break down the task, or brainstorm. You can attach the result to the current task.
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your question or advice..."
              className="min-h-[140px]"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={attach}
                onChange={(e) => setAttach(e.target.checked)}
              />
              Attach to current task notes
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={!text.trim()}>Send</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
