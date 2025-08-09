const tabs = [
  { key: "home", label: "Home" },
  { key: "map", label: "Roadmap" },
  { key: "live", label: "Session" },
  { key: "rank", label: "Trophy" },
  { key: "aurora", label: "Aurora" },
];

export default function BottomGameNav() {
  return (
    <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.5)]">
      <ul className="grid grid-cols-5 gap-2 p-2">
        {tabs.map((t) => (
          <li key={t.key} className="w-14 h-12 grid place-items-center">
            <span className={`css-icon-${t.key}`} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
