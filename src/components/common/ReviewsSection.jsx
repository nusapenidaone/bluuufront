import { useRef, useEffect } from "react";
import ElfsightWidget from "./ElfsightWidget";

export default function ReviewsSection({ appId = "1f614ea8-8602-4273-83b3-ab40c213a3d7" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const timer = setTimeout(() => { if (window.eapps?.Platform) window.eapps.Platform.refresh(); }, 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="mt-16 pt-12 pb-32 container" ref={ref}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl mb-2">What guests say</h2>
        <p className="text-secondary-500 text-base">Real reviews from real travellers</p>
      </div>
      <ElfsightWidget appId={appId} />
    </div>
  );
}
