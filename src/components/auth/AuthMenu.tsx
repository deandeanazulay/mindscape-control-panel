
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function AuthMenu() {
  const { user } = useSupabaseAuth();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Sign out failed", description: error.message });
      return;
    }
    toast({ title: "Signed out", description: "You have been signed out." });
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="primary" size="lg">
          <Link to="/auth">Get Started Free</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground max-w-[160px] truncate">{user.email}</span>
      <Button variant="softPrimary" size="sm" onClick={signOut}>Sign out</Button>
    </div>
  );
}
