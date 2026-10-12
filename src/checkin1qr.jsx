import { useEffect, useState } from "react";
import { Loader2, Download, Info } from "lucide-react";
import { apiUrl } from "./api/base";
import SeeYouAgain from "./components/common/SeeYouAgain";

// Post-checkin confirmation page for the /checkin1 React flow — the React
// counterpart of themes/bluuu/pages/checkin/qr.htm, which is left untouched
// and keeps serving /checkin/:id/qr. Fed by Checkin1Controller::qr (returns
// the QR PNG and the printable PDF as base64 data URIs, same as the PHP page).

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, day] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function Row({ label, children, last }) {
  return (
    <div className={"flex items-center justify-between py-3 text-sm" + (last ? "" : " border-b border-secondary-100")}>
      <span className="text-secondary-500">{label}</span>
      <span className="max-w-[58%] text-right font-bold text-secondary-900">{children}</span>
    </div>
  );
}

const CARD = "w-full max-w-[480px] overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-floating";

function CheckBadge() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="mb-5">
      <circle cx="36" cy="36" r="36" fill="url(#checkin1-qr-cg)" />
      <polyline points="22,36 31,45 50,27" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="checkin1-qr-cg" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0073E0" />
          <stop offset="100%" stopColor="#005CB3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CenteredShell({ children }) {
  return (
    <div className="min-h-screen bg-secondary-100">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-3.5 shadow-[0_2px_16px_rgba(0,115,224,0.3)]">
        <img src="/themes/bluuu/assets/img/logo-white.svg" alt="Bluuu" className="block h-[26px]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">Check-In Complete</span>
      </div>
      <div className="flex flex-col items-center px-4 pb-20 pt-8">{children}</div>
    </div>
  );
}

export default function Checkin1Qr({ odooId, uniqueKey }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!odooId || !uniqueKey) { setNotFound(true); setLoading(false); return; }

    let cancelled = false;
    fetch(apiUrl(`checkin1/${odooId}/${uniqueKey}/qr`))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        if (!cancelled) { setData(json); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setNotFound(true); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [odooId, uniqueKey]);

  if (loading) {
    return (
      <CenteredShell>
        <div className={CARD + " flex items-center justify-center py-20"}>
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      </CenteredShell>
    );
  }

  if (notFound || !data) {
    return (
      <CenteredShell>
        <div className={CARD + " px-7 py-10 text-center"}>
          <div className="mb-2 text-lg font-bold text-secondary-900">Order not found</div>
          <div className="text-sm text-secondary-400">This check-in link is invalid.</div>
        </div>
      </CenteredShell>
    );
  }

  if (data.expired) {
    return (
      <CenteredShell>
        <SeeYouAgain name={data.name} />
      </CenteredShell>
    );
  }

  return (
    <CenteredShell>
      <CheckBadge />

      <div className="mb-6 text-center">
        <div className="text-2xl font-bold tracking-tight text-secondary-900">Check-In Complete!</div>
        <div className="mt-1.5 text-sm leading-relaxed text-secondary-500">
          Dear {data.name},<br />we look forward to seeing you soon.
        </div>
      </div>

      <div className={CARD + " mb-3.5"}>
        <div className="px-6 pt-[18px] text-[11px] font-bold uppercase tracking-[0.1em] text-secondary-500">Your Trip</div>
        <div className="px-6 pb-[18px] pt-1">
          <Row label="Travel Date">{fmtDate(data.travel_date)}</Row>
          <Row label="Meeting Time">{data.meeting_time || "—"}</Row>
          <Row label="Yacht">{data.boat_name || "—"}</Row>
          {data.route ? <Row label="Route">{data.route}</Row> : null}
          <Row label="Meeting Point" last>
            <a
              href="https://maps.app.goo.gl/psZ9yCoLiJ7ZyG4S9"
              target="_blank"
              rel="noreferrer"
              className="leading-snug text-primary-600 no-underline"
            >
              Bluuu Tours office<br />Serangan Harbor
            </a>
          </Row>
        </div>
      </div>

      <div className={CARD + " mb-3.5"}>
        <div className="px-6 pb-1.5 pt-5 text-center">
          <div className="text-base font-bold text-secondary-900">Your Check-In QR Code</div>
          <div className="mt-1 text-xs leading-relaxed text-secondary-400">
            Show this to our manager at the check-in desk<br />on the day of your tour
          </div>
        </div>
        <div className="px-6 pb-5 pt-4">
          <img src={data.qr} alt="QR Code" className="block w-full rounded-2xl border border-secondary-100" />
        </div>
        <div className="mx-6 mb-5 flex items-center gap-2.5 rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3">
          <Info className="h-4 w-4 flex-shrink-0 text-primary-600" />
          <span className="text-xs leading-snug text-secondary-600">
            This QR links directly to your order in our system. Please arrive 15 minutes before meeting time.
          </span>
        </div>
      </div>

      <div className="w-full max-w-[480px]">
        <a
          href={data.pdf}
          download="bluuu-checkin.pdf"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-[15px] text-[15px] font-bold text-white no-underline shadow-blue-glow"
        >
          <Download className="h-4 w-4" />
          Download &amp; Save QR Code (PDF)
        </a>
        <div className="mt-2.5 text-center text-xs text-secondary-400">Save the PDF to your phone for offline access</div>
      </div>
    </CenteredShell>
  );
}
