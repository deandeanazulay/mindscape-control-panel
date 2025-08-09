
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function MoodCheck() {
  const click = (mood: string) => {
    toast({
      title: `Mood: ${mood}`,
      description: "Thanks! We'll use this to improve suggestions soon.",
    });
  };

  return (
    <div className="glass-panel rounded-xl p-3 elev flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Mood</span>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => click("Stressed")}>Stressed</Button>
        <Button size="sm" variant="outline" onClick={() => click("Calm")}>Calm</Button>
        <Button size="sm" variant="outline" onClick={() => click("Tired")}>Tired</Button>
        <Button size="sm" variant="outline" onClick={() => click("Confident")}>Confident</Button>
      </div>
    </div>
  );
}
