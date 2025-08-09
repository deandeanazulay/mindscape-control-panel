
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { SoundControl } from "@/components/sounds/SoundControl";

import { useEffect, useRef, useState } from "react";

type Task = {
  id: string;
};


type Track = {
  id: string;
  title: string;
  audio_url: string;
  description: string | null;
};

export function QuickActionsBar({ currentTask }: { currentTask: Task | null }) {
  
  const { user } = useSupabaseAuth();

  // Hypnosis tracks (publicly readable)
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setTracksLoading(true);
      const { data, error } = await supabase
        .from("tracks")
        .select("id, title, audio_url, description")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!mounted) return;
      if (error) console.error(error);
      setTracks((data ?? []) as Track[]);
      setTracksLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Notes
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const saveNote = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Connect Supabase to capture notes." });
      return;
    }
    if (!noteText.trim()) return;
    const { error } = await supabase.from("moments").insert({
      user_id: user.id,
      type: "text",
      content: noteText.trim(),
      folder: "Memories",
      tags: currentTask ? ["note", "task", currentTask.id] : ["note"],
      visibility: "private",
    });
    if (error) {
      console.error(error);
      return;
    }
    toast({ title: "Saved", description: "Your note has been added to Archive." });
    setNoteText("");
    setNoteOpen(false);
  };

  // Voice note recording
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Connect Supabase to record voice notes." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      setChunks([]);
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) setChunks((prev) => [...prev, e.data]);
      };
      mr.onstop = async () => {
        if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const filePath = `${user!.id}/${Date.now()}.webm`;
          const { error: upErr } = await supabase.storage.from("voice-notes").upload(filePath, blob, { contentType: "audio/webm" });
          if (upErr) throw upErr;
          const { error: insErr } = await supabase.from("moments").insert({
            user_id: user!.id,
            type: "audio",
            content: "Voice note",
            storage_path: `voice-notes/${filePath}`,
            folder: "Memories",
            tags: currentTask ? ["voice", "task", currentTask.id] : ["voice"],
            visibility: "private",
          });
          if (insErr) throw insErr;
          toast({ title: "Saved", description: "Voice note added to Archive." });
        } catch (e) {
          console.error(e);
          toast({ title: "Error", description: "Could not save voice note." });
        } finally {
          setRecording(false);
          setVoiceOpen(false);
          setElapsed(0);
          stream.getTracks().forEach((t) => t.stop());
        }
      };
      mr.start();
      setRecorder(mr);
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000) as unknown as number;
    } catch (e) {
      console.error(e);
      toast({ title: "Microphone blocked", description: "Please allow microphone access." });
    }
  };

  const stopRecording = () => {
    try {
      recorder?.stop();
    } catch {}
  };


  return (
    <div className="glass-panel rounded-xl p-3 elev flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Play Sound */}
      <SoundControl label="Play Sound" buttonVariant="secondary" buttonSize="sm" />

      {/* Hypnosis quick-play */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Start Hypnosis</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hypnosis library</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground mb-2">Tap a track to open in a new tab and play.</div>
          <div className="max-h-72 overflow-y-auto grid gap-2">
            {tracksLoading && <div className="text-sm">Loading...</div>}
            {!tracksLoading && tracks.length === 0 && (
              <div className="text-sm text-muted-foreground">No tracks available.</div>
            )}
            {tracks.map((t) => (
              <a
                key={t.id}
                href={t.audio_url}
                target="_blank"
                rel="noreferrer"
                className="block p-3 rounded border border-border hover:bg-muted/50 smooth"
              >
                <div className="font-medium text-sm">{t.title}</div>
                {t.description && <div className="text-xs text-muted-foreground mt-1">{t.description}</div>}
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analyze */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => toast({ title: "Analyze", description: "Use the Analyze panel below to capture a decision card." })}
      >
        Open Analyze Tool
      </Button>

      {/* Voice Note */}
      <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost">Voice Note</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record voice note</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {recording ? "Recording..." : "Tap record to start. Saved privately to Archive."}
            </div>
            <div className="text-sm font-mono tabular-nums">{String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}</div>
          </div>
          <div className="flex justify-end gap-2">
            {!recording ? (
              <Button onClick={startRecording}>Record</Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording}>Stop & Save</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost">Notes</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick note</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type a quick note..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={saveNote}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
