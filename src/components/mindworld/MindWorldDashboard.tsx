import HubScene from "./HubScene";
import MoodButton from "./MoodButton";
import SideScrollWorld from "./SideScrollWorld";

export default function MindWorldDashboard() {
  return (
    <section className="w-full h-full">
      <HubScene>
        {/* Top bar */}
        <div className="absolute top-4 inset-x-0 px-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Your Mind World</div>
          <MoodButton />
        </div>

        {/* Side-scrolling world */}
        <div className="absolute inset-0">
          <SideScrollWorld />
        </div>
      </HubScene>
    </section>
  );
}
