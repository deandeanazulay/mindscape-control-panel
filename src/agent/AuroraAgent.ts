import { VoiceIO } from "@/voice/voiceio";
import { ToolImpl } from "@/agent/tool-impl";

export type AgentEvents = {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onResponse?: (text: string) => void;
  onListeningChange?: (v: boolean) => void;
  onSpeakingChange?: (v: boolean) => void;
  onError?: (e: any) => void;
};

export class AuroraAgent {
  private voice: VoiceIO;
  private listening = false;

  constructor(private events: AgentEvents = {}) {
    this.voice = new VoiceIO({
      onPartial: (t) => this.events.onPartial?.(t),
      onFinal: (t) => this.onFinalText(t),
      onSpeakingChange: (s) => this.events.onSpeakingChange?.(s),
      onError: (e) => this.events.onError?.(e),
    });
  }

  startPTT() {
    this.listening = true;
    this.events.onListeningChange?.(true);
    this.voice.startPushToTalk();
  }

  stopPTT() {
    this.voice.stopListening();
    this.listening = false;
    this.events.onListeningChange?.(false);
  }

  private async onFinalText(text: string) {
    this.events.onFinal?.(text);

    // quick intent guess (optimistic)
    const lower = text.toLowerCase();
    const minutesMatch = /(?:for|in)?\s*(\d{1,2})\s*(?:min|minutes|m)\b/.exec(lower);

    if (/\b(start|begin)\b.*\bfocus\b/.test(lower) || /\bfocus mode\b/.test(lower)) {
      const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 25;
      await ToolImpl.start_focus({ minutes });
      this.say(`Starting a ${minutes}-minute focus.`);
      return;
    }

    if (/\b(hypnosis|induction|calm|confidence|focus)\b/.test(lower)) {
      const mode = /confidence/.test(lower) ? 'confidence' : /calm/.test(lower) ? 'calm' : 'focus';
      await ToolImpl.start_hypnosis({ mode: mode as any, duration: 60 });
      this.say(`Running a short ${mode} induction.`);
      return;
    }

    if (/\bsummary|summarize\b/.test(lower)) {
      const { summary } = await ToolImpl.summarize_selection({ length: 'short' });
      this.say(summary);
      return;
    }

    // fallback reply
    this.say("Okay.");
  }

  say(text: string) {
    this.events.onResponse?.(text);
    this.voice.speak(text);
  }
}
