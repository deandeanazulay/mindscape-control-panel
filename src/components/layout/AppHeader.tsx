import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SoundControl } from "@/components/sounds/SoundControl";
import { AuthMenu } from "@/components/auth/AuthMenu";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function AppHeader() {
  const { user, initializing } = useSupabaseAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 inset-x-0 z-30">
      <div className="px-4 sm:px-6">
        <div className="mt-3 glass-panel rounded-full px-3 py-2 elev flex items-center justify-between gap-3 animate-fade-in smooth">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <button
              className="text-sm font-semibold tracking-wide hover-scale"
              onClick={() => navigate("/")}
              aria-label="Go to Home"
            >
              MOS
            </button>
            <span className="hidden sm:inline text-xs text-muted-foreground">Mind Operating System</span>
          </div>

          {/* Right controls */}
          <nav className="flex items-center gap-2">
            {!initializing && !user && (
              <Button asChild variant="secondary" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
            <SoundControl buttonSize="icon" buttonVariant="ghost" />
            <AuthMenu />
          </nav>
        </div>
      </div>
      {/* SEO: single H1 for the app */}
      <h1 className="sr-only">Mind Operating System – Focus, Roadmaps, and Progress</h1>
    </header>
  );
}
