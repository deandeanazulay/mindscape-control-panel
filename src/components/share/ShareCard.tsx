import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  progressPercent: number;
}

export default function ShareCard({ open, onOpenChange, progressPercent }: Props) {
  const { user } = useSupabaseAuth();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const name = useMemo(() => {
    const email = user?.email || "";
    return email.split("@")[0] || "You";
  }, [user]);

  const mood = useMemo(() => {
    try {
      const m = localStorage.getItem('mood.last') || 'Calm';
      const map: Record<string, string> = { Stressed: '😰', Calm: '😌', Tired: '🥱', Confident: '💪' };
      return map[m] || '🙂';
    } catch { return '🙂'; }
  }, []);

  useEffect(() => {
    if (!open) { setImgUrl(null); return; }
    const el = nodeRef.current;
    if (!el) return;
    // Delay to ensure fonts/styles applied
    const t = setTimeout(async () => {
      try {
        const dataUrl = await htmlToImage.toPng(el, { pixelRatio: 2, backgroundColor: "#0f1113" });
        setImgUrl(dataUrl);
      } catch (e) { console.error(e); }
    }, 50);
    return () => clearTimeout(t);
  }, [open]);

  const onDownload = async () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = 'progress-card.png';
    a.click();
  };

  const onShare = async () => {
    if (navigator.share && imgUrl) {
      try {
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const file = new File([blob], 'progress.png', { type: 'image/png' });
        await (navigator as any).share({ files: [file], title: 'My progress', text: 'Made with our app' });
      } catch (e) { console.error(e); }
    } else {
      await onDownload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share your progress</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div ref={nodeRef} className="rounded-2xl p-6" style={{
            width: 640,
            maxWidth: '100%',
            color: 'white',
            background: 'linear-gradient(180deg, rgba(29,161,242,0.18), rgba(29,161,242,0.06))',
            border: '1px solid rgba(255,255,255,0.12)'
          }}>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">{name}</div>
              <div className="text-2xl" aria-label="Mood">{mood}</div>
            </div>
            <div className="mt-2 text-sm opacity-80">Today's Progress</div>
            <div className="mt-1 h-3 w-full bg-[#2a2e34] rounded-full overflow-hidden">
              <div className="h-full bg-[#1DA1F2]" style={{ width: `${Math.max(0, Math.min(100, Math.round(progressPercent)))}%` }} />
            </div>
            <div className="mt-3 text-sm">Streak: 🔥
              <span id="streak-val" style={{ marginLeft: 6 }}>{/* populated via effect below if needed*/}</span>
            </div>
            <div className="mt-8 text-xs opacity-70">Made with Your App</div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={onDownload}>Download</Button>
            <Button variant="ghost" onClick={async () => {
              await onDownload();
              toast({ title: 'Instagram', description: 'Image downloaded. Open Instagram and post your card.' });
            }}>Instagram</Button>
            <Button variant="ghost" onClick={async () => {
              await onDownload();
              toast({ title: 'TikTok', description: 'Image downloaded. Open TikTok and upload your card.' });
            }}>TikTok</Button>
            <Button variant="ghost" onClick={() => {
              const text = encodeURIComponent('I just made progress! #MadeWithYourApp');
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
            }}>X</Button>
            <Button onClick={onShare}>Share</Button>
          </div>
          {imgUrl && (
            <img src={imgUrl} alt="Share preview" className="w-full rounded border border-border" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
