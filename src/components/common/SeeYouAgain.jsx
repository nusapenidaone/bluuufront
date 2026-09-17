import { Waves } from "lucide-react";

// Shared "trip already happened" screen — dropped into cabinet.jsx (inside its
// normal Navbar/Footer shell) and checkin1.jsx/checkin1qr.jsx (inside their
// minimal CenteredShell) once a link's travel_date has passed. Replaces what
// would otherwise be a stale edit form / check-in wizard for a trip that's over.
export default function SeeYouAgain({ name, ctaHref = "/", ctaLabel = "Back to Bluuu Tours" }) {
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-[22px] border border-neutral-200 bg-white text-center shadow-floating">
      <div className="flex flex-col items-center bg-gradient-to-br from-primary-600 to-primary-700 px-7 pb-8 pt-10">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <Waves className="h-8 w-8 text-white" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">
          {name ? `Thank you, ${name}!` : "Thank you for sailing with us!"}
        </div>
      </div>
      <div className="px-7 py-7">
        <p className="text-sm leading-relaxed text-secondary-500">
          This trip has already sailed. We hope you had an amazing time with Bluuu Tours —
          we'd love to have you back on the water again soon.
        </p>
        <a
          href={ctaHref}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-[15px] text-[15px] font-bold text-white no-underline shadow-blue-glow"
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
