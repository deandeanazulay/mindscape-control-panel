import LessonPath from "./LessonPath";
import HudBar from "./HudBar";
import BottomGameNav from "./BottomGameNav";

export default function GameHome() {
  return (
    <div className="min-h-screen bg-[hsl(var(--path-bg))] text-white relative overflow-hidden">
      <HudBar />
      <LessonPath />
      <BottomGameNav />
    </div>
  );
}
