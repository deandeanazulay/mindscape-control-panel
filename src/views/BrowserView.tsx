import { useLocation } from "react-router-dom";
import { EmbedPane } from "@/routes/browser/EmbedPane";

export default function BrowserView() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const url = params.get("url") || "";
  return (
    <div className="h-[calc(100vh-160px)]">
      <EmbedPane url={url} />
    </div>
  );
}
