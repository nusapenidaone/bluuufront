import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { apiUrl } from "./api/base";
import SeeYouAgain from "./components/common/SeeYouAgain";

// React rewrite of the check-in wizard, trialled in parallel at /checkin1/:odoo_id/:key
// while /checkin/:odoo_id (themes/bluuu/pages/checkin/checkin.htm) keeps running
// unchanged. Talks to the standalone Checkin1Controller (api/new/checkin1/*).
// Auth mirrors the personal cabinet: the link must carry x_studio_unique_key.

const MENU_COURSES = [
  { id: "starter", name: "Starter", options: [
    { id: "s1", name: "Gyoza", desc: "Pan-fried dumplings" },
    { id: "s2", name: "Beef Tataki", desc: "Seared beef slices" },
    { id: "s3", name: "Brazilian Croquettes", desc: "Crispy cheese croquettes" },
  ] },
  { id: "main", name: "Main Course", options: [
    { id: "m1", name: "BBQ Prawn", desc: "Grilled jumbo prawns" },
    { id: "m2", name: "Beef Kebab BBQ", desc: "Grilled beef kebab" },
    { id: "m3", name: "Chicken Gravy Steak", desc: "Pan-seared chicken" },
  ] },
  { id: "dessert", name: "Dessert", options: [
    { id: "d1", name: "Chocolate Mousse", desc: "Rich dark chocolate mousse" },
    { id: "d2", name: "Churros", desc: "Crispy fried dough" },
    { id: "d3", name: "Melting Tiramisu", desc: "Classic Italian dessert" },
  ] },
  { id: "beverages", name: "Beverages", options: [
    { id: "b1", name: "Soft Drinks", desc: "Coke, Sprite, Fanta" },
    { id: "b2", name: "Freshness", desc: "Fresh juices & smoothies" },
    { id: "b3", name: "Cocktails", desc: "Classic cocktails" },
  ] },
];

const COUNTRIES = ["Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia","Croatia","Czech Republic","Denmark","Egypt","Estonia","Finland","France","Georgia","Germany","Ghana","Greece","Hong Kong","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kazakhstan","Kenya","Korea, Republic of","Kuwait","Latvia","Lebanon","Lithuania","Macau","Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Philippines","Poland","Portugal","Qatar","Romania","Russian Federation","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa","Spain","Sri Lanka","Sweden","Switzerland","Taiwan","Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom","United States","Uzbekistan","Viet Nam"];

function fmtIDR(n) {
  return "IDR " + Number(n || 0).toLocaleString("id-ID");
}

function fmtDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function hasRegContent(s) {
  return !!(s && (s.title || s.desc || (s.list && s.list.length > 0) || s.text));
}

function buildVisibleSteps(order) {
  const reg = order.reg;
  const steps = ["overview", "intro", "video", "meet"];
  ["s4", "s5", "s6", "s7", "s8"].forEach((k, i) => {
    if (hasRegContent(reg[k])) steps.push("info" + (i + 4));
  });
  steps.push("passengers");
  if (order.has_lunch) steps.push("menu");
  if (order.collect > 0) steps.push("balance");
  return steps;
}

// ─── Shared bits ────────────────────────────────────────────────────────────

function Stepper({ total, current }) {
  const pct = total > 1 ? Math.round(((current - 1) / (total - 1)) * 100) : 100;
  return (
    <div className="mb-4 w-full max-w-[520px] px-1">
      <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-secondary-400">
        <span className="text-secondary-600">Step {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-full bg-secondary-200">
        <div
          className="h-full rounded-full bg-gradient-to-br from-primary-600 to-primary-700 transition-[width] duration-300"
          style={{ width: pct + "%" }}
        />
      </div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={
        "flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-[15px] text-[15px] font-bold transition " +
        (disabled
          ? "cursor-not-allowed bg-secondary-200 text-secondary-400"
          : "cursor-pointer bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-blue-glow")
      }
    >
      {children}
    </button>
  );
}

function LoadingBtn({ text = "Please wait" }) {
  return (
    <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-secondary-200 px-7 py-[15px] text-[15px] font-bold text-secondary-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-secondary-400">
      <ArrowLeft className="h-[15px] w-[15px]" />
      Back
    </button>
  );
}

function TripRow({ label, value, last, accent }) {
  return (
    <div className={"flex items-center justify-between py-3" + (last ? "" : " border-b border-secondary-200")}>
      <span className="text-[13px] text-secondary-600">{label}</span>
      <span className={"max-w-[58%] text-right text-[13px] font-bold " + (accent ? "text-primary-600" : "text-secondary-900")}>{value}</span>
    </div>
  );
}

function RadioOpt({ label, sub, checked, onClick, last }) {
  return (
    <div onClick={onClick} className={"flex cursor-pointer items-center gap-3.5 py-[15px]" + (last ? "" : " border-b border-secondary-200")}>
      <div className={
        "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all " +
        (checked ? "border-primary-600 bg-primary-600" : "border-secondary-300 bg-transparent")
      }>
        {checked && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-secondary-900">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-secondary-400">{sub}</div>}
      </div>
    </div>
  );
}

function CardHeader({ title, sub, onBack }) {
  return (
    <div className="border-b border-secondary-200 px-7 pb-5 pt-[22px]">
      {onBack && <BackBtn onClick={onBack} />}
      <div className={onBack ? "mt-3.5" : ""}>
        <div className="text-[22px] font-bold tracking-tight text-secondary-900">{title}</div>
        {sub && <div className="mt-1 text-[13px] text-secondary-400">{sub}</div>}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <div className="mb-1.5 text-xs font-semibold tracking-wide text-secondary-600">
      {children}{required && <span className="ml-0.5 text-red-500">*</span>}
    </div>
  );
}

const CARD = "w-full max-w-[520px] overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-floating";
const CARD_WIDE = "w-full max-w-[560px] overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-floating";
const RICH_TEXT = "rich-text text-[14px] leading-[1.7] text-secondary-600 [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-bold";
const INPUT = "w-full appearance-none rounded-xl border-[1.5px] border-secondary-200 bg-white px-3.5 py-2.5 text-sm text-secondary-900 outline-none transition-colors focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10";

// ─── Step: Overview ─────────────────────────────────────────────────────────

function StepOverview({ order, goNext }) {
  return (
    <div className={CARD}>
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-7 pb-7 pt-8">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
          Check-In · {order.order_number}
        </div>
        <div className="text-[26px] font-bold leading-tight tracking-tight text-white">
          Hello, {order.name}!
        </div>
        <div className="mt-2 text-sm leading-relaxed text-white/70">
          We're looking forward to seeing you.<br />Please review your trip details below.
        </div>
      </div>
      <div className="px-7 pt-1">
        <TripRow label="Travel Date" value={fmtDate(order.travel_date)} />
        <TripRow label="Meeting Time" value={order.meeting_time || "—"} />
        <TripRow label="Yacht" value={order.boat_name || "—"} />
        {order.route ? <TripRow label="Route" value={order.route} /> : null}
        <TripRow
          label="Passengers"
          value={
            order.adults + order.kids > 0
              ? `${order.adults + order.kids} total` + (order.adults ? ` (${order.adults} adults${order.kids ? `, ${order.kids} kids` : ""})` : "")
              : "—"
          }
          last={!order.collect}
        />
        {order.collect > 0 && (
          <div className="flex items-center justify-between gap-3 py-3.5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-primary-800">Remaining Balance</div>
              <div className="mt-0.5 text-xs text-secondary-400">Pay online or at the office</div>
            </div>
            <div className="flex-shrink-0 text-xl font-bold text-primary-600">{fmtIDR(order.collect)}</div>
          </div>
        )}
      </div>
      <div className="px-7 pb-7 pt-4">
        <PrimaryBtn onClick={goNext}>Start Check-In <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
        <div className="mt-2.5 text-center text-xs text-secondary-400">Takes about 2 minutes</div>
      </div>
    </div>
  );
}

// ─── Step: Registration intro (hero image) ─────────────────────────────────

function StepRegIntro({ order, goBack, goNext }) {
  const reg = order.reg;
  return (
    <div className={CARD}>
      {reg.s1_img ? (
        <div className="relative h-60 overflow-hidden rounded-t-[22px]">
          <img src={reg.s1_img} alt="" className="block h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />
          {reg.s1_title && (
            <div className="absolute inset-x-0 bottom-0 px-7 py-5">
              <div className="text-[22px] font-bold leading-tight tracking-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">
                {reg.s1_title}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-7 pb-5 pt-7">
          <div className="text-[22px] font-bold text-white">{reg.s1_title || "Welcome"}</div>
        </div>
      )}
      <div className="px-7 pb-7 pt-5">
        <BackBtn onClick={goBack} />
        {reg.s1_desc ? (
          <div className={RICH_TEXT + " mt-4"} dangerouslySetInnerHTML={{ __html: reg.s1_desc }} />
        ) : null}
        <div className="mt-6">
          <PrimaryBtn onClick={goNext}>Next Step <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Registration video ───────────────────────────────────────────────

function StepRegVideo({ order, goBack, goNext }) {
  const reg = order.reg;
  return (
    <div className={CARD}>
      <CardHeader title={reg.s2_title || "Your Tour"} onBack={goBack} />
      <div>
        {reg.s2_video ? (
          <div className="relative h-0 overflow-hidden pb-[56.25%]">
            <iframe
              src={reg.s2_video}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
        {reg.s2_desc ? (
          <div className={RICH_TEXT + " px-7 pt-4"} dangerouslySetInnerHTML={{ __html: reg.s2_desc }} />
        ) : null}
        <div className="px-7 pb-7 pt-5">
          <PrimaryBtn onClick={goNext}>Next Step <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Meeting point ────────────────────────────────────────────────────

function StepRegMeet({ order, goBack, goNext }) {
  const reg = order.reg;
  return (
    <div className={CARD}>
      <CardHeader title={reg.s3_title || "Meeting Point"} onBack={goBack} />
      <div className="px-7 py-4">
        <div className="mb-4 overflow-hidden rounded-2xl border border-secondary-200 bg-secondary-50">
          <div className="flex items-center border-b border-secondary-200 px-4 py-3">
            <span className="flex-1 text-[13px] text-secondary-600">Date</span>
            <span className="text-[13px] font-bold text-secondary-900">{fmtDate(order.travel_date)}</span>
          </div>
          <div className="flex items-center px-4 py-3">
            <span className="flex-1 text-[13px] text-secondary-600">Meeting Time</span>
            <span className="text-[13px] font-bold text-secondary-900">{order.meeting_time || "—"}</span>
          </div>
        </div>
        {reg.s3_map ? (
          <div
            className="mb-4 [&_iframe]:block [&_iframe]:h-[260px] [&_iframe]:w-full [&_iframe]:rounded-2xl [&_iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: reg.s3_map }}
          />
        ) : null}
        {reg.s3_text ? (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl border border-secondary-200 bg-secondary-50 px-3.5 py-2.5 text-center text-[13px] text-secondary-600">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {reg.s3_text}
          </div>
        ) : null}
        {reg.s3_desc ? (
          <div className={RICH_TEXT + " mb-4 text-[13px]"} dangerouslySetInnerHTML={{ __html: reg.s3_desc }} />
        ) : null}
      </div>
      <div className="px-7 pb-7 pt-1">
        <PrimaryBtn onClick={goNext}>I Agree, Continue <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Step: Generic info (steps 4-8) ─────────────────────────────────────────

function StepRegInfo({ reg, goBack, goNext }) {
  return (
    <div className={CARD}>
      <CardHeader title={reg.title || "Information"} onBack={goBack} />
      <div className="px-7 pb-7 pt-5">
        {reg.desc ? (
          <div className={RICH_TEXT + (reg.list && reg.list.length ? " mb-5" : "")} dangerouslySetInnerHTML={{ __html: reg.desc }} />
        ) : null}
        {reg.list && reg.list.length > 0 ? (
          <div className={"flex flex-col gap-2.5 " + (reg.text ? "mb-4" : "mb-6")}>
            {reg.list.map((item, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-secondary-200 bg-secondary-50 px-[18px] py-4">
                {item.icon ? (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-secondary-200 bg-white shadow-sm">
                    <img src={item.icon} alt="" className="h-[42px] w-[42px] object-contain" />
                  </div>
                ) : null}
                <div className={"flex-1 " + (item.icon ? "pt-0.5" : "")}>
                  {item.title ? <div className="mb-1 text-sm font-bold text-secondary-900">{item.title}</div> : null}
                  {item.text ? <div className={RICH_TEXT + " text-[13px] leading-snug"} dangerouslySetInnerHTML={{ __html: item.text }} /> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {reg.text ? (
          <div className="mb-5 rounded-xl border border-secondary-200 bg-secondary-50 px-3.5 py-3 text-[13px] text-secondary-600">
            {reg.text}
          </div>
        ) : null}
        <PrimaryBtn onClick={goNext}>Next Step <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Step: Passengers ───────────────────────────────────────────────────────

function StepPassengers({ order, setOrder, goBack, nextStep, go }) {
  const [showErr, setShowErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email);

  const passengers =
    order.passengers.length === order.count_of_people
      ? order.passengers
      : Array.from({ length: order.count_of_people }, (_, i) => order.passengers[i] || { name: "", age: "", gender: "", country: "" });

  useEffect(() => {
    if (order.passengers.length !== order.count_of_people) {
      setOrder((o) => ({ ...o, passengers }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateP(i, field, val) {
    const ps = passengers.map((p, idx) => (idx === i ? { ...p, [field]: val } : p));
    setOrder((o) => ({ ...o, passengers: ps }));
  }

  function paxOk(p) {
    return p.name.trim() && p.age && p.gender && p.country;
  }

  function allPaxOk() {
    return passengers.every(paxOk);
  }

  async function submit(paxList) {
    setLoading(true);
    setOrder((o) => ({ ...o, passengers: paxList }));
    if (nextStep) {
      go(nextStep);
      return;
    }
    try {
      const res = await fetch(apiUrl(`checkin1/${order.odoo_id}/${order.key}/save`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengers: paxList, email: order.email }),
      });
      if (!res.ok) throw new Error();
      window.location.href = "/checkin1/" + order.odoo_id + "/" + order.key + "/qr";
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  function proceed() {
    setShowErr(true);
    if (!emailOk) return;
    if (!allPaxOk()) return;
    submit(passengers);
  }

  function skip() {
    if (!emailOk) { setShowErr(true); return; }
    submit([]);
  }

  return (
    <div className={CARD_WIDE}>
      <CardHeader title="Passenger Details" sub="Required for insurance and boarding documentation" onBack={goBack} />
      <div className="px-7 pb-7 pt-[22px]">
        <div className="mb-6">
          <div className="mb-3.5 border-b border-secondary-200 pb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-secondary-900">
            Contact Info
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <FieldLabel required>Email</FieldLabel>
              <input
                type="email"
                placeholder="your@email.com"
                value={order.email}
                className={INPUT + (showErr && !emailOk ? " !border-red-500" : "")}
                onChange={(e) => setOrder((o) => ({ ...o, email: e.target.value }))}
              />
              {showErr && !emailOk && <div className="mt-1 text-[11px] text-red-500">Enter a valid email address</div>}
            </div>
            <div>
              <FieldLabel>WhatsApp</FieldLabel>
              <input
                type="tel"
                placeholder="+62 8xx xxxx xxxx"
                value={order.phone}
                className={INPUT}
                onChange={(e) => setOrder((o) => ({ ...o, phone: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="mb-3.5 border-b border-secondary-200 pb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-secondary-900">
          Passengers
          <span className="ml-2 text-[13px] font-normal normal-case tracking-normal text-secondary-400">({order.count_of_people} total)</span>
        </div>

        {passengers.map((p, i) => {
          const err = showErr && !paxOk(p);
          return (
            <div key={i} className={"mb-2.5 rounded-2xl border-[1.5px] bg-secondary-50 px-4 py-3.5 " + (err ? "border-red-500" : "border-secondary-200")}>
              <div className="mb-2.5 flex items-center justify-between">
                <div className={"text-[11px] font-bold uppercase tracking-[0.08em] " + (err ? "text-red-500" : "text-primary-600")}>
                  Passenger {i + 1}
                </div>
                {err && <div className="text-[11px] font-semibold text-red-500">Fill all fields</div>}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_68px_90px_1fr]">
                <input
                  placeholder="Full Name"
                  value={p.name}
                  className={INPUT + (showErr && !p.name.trim() ? " !border-red-500" : "")}
                  onChange={(e) => updateP(i, "name", e.target.value)}
                />
                <select
                  value={p.age}
                  className={INPUT + " cursor-pointer" + (showErr && !p.age ? " !border-red-500" : "")}
                  onChange={(e) => updateP(i, "age", e.target.value)}
                >
                  <option value="" disabled>Age</option>
                  {Array.from({ length: 100 }, (_, j) => <option key={j + 1} value={j + 1}>{j + 1}</option>)}
                </select>
                <select
                  value={p.gender}
                  className={INPUT + " cursor-pointer" + (showErr && !p.gender ? " !border-red-500" : "")}
                  onChange={(e) => updateP(i, "gender", e.target.value)}
                >
                  <option value="" disabled>Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <select
                  value={p.country}
                  className={INPUT + " cursor-pointer" + (showErr && !p.country ? " !border-red-500" : "")}
                  onChange={(e) => updateP(i, "country", e.target.value)}
                >
                  <option value="" disabled>Country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          );
        })}

        <div className="mt-6 flex flex-col gap-2.5">
          {!loading ? (
            <>
              <PrimaryBtn onClick={proceed}>{nextStep ? "Continue" : "Complete Check-In"} <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
              <button onClick={skip} className="w-full cursor-pointer rounded-2xl border border-secondary-200 bg-secondary-100 py-3.5 text-sm font-semibold text-secondary-600">
                Skip passenger details
              </button>
            </>
          ) : <LoadingBtn />}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Menu selection ───────────────────────────────────────────────────

function StepMenu({ order, setOrder, goBack, nextStep, go }) {
  const total = order.count_of_people;
  const [menu, setMenu] = useState(() =>
    Object.fromEntries(MENU_COURSES.map((c) => [c.id, Object.fromEntries(c.options.map((o) => [o.id, 0]))]))
  );
  const [loading, setLoading] = useState(false);

  function courseTotal(cid) {
    return Object.values(menu[cid] || {}).reduce((s, v) => s + v, 0);
  }

  function updateQty(cid, oid, delta) {
    setMenu((prev) => {
      const ct = courseTotal(cid);
      const cur = prev[cid][oid];
      const nxt = Math.max(0, cur + delta);
      if (delta > 0 && ct >= total) return prev;
      return { ...prev, [cid]: { ...prev[cid], [oid]: nxt } };
    });
  }

  function isOver() {
    return MENU_COURSES.some((c) => courseTotal(c.id) > total);
  }

  async function finish(selection) {
    setOrder((o) => ({ ...o, menu: selection }));
    if (nextStep) {
      go(nextStep);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`checkin1/${order.odoo_id}/${order.key}/save`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengers: order.passengers, email: order.email, menu: selection }),
      });
      if (!res.ok) throw new Error();
      window.location.href = "/checkin1/" + order.odoo_id + "/" + order.key + "/qr";
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <div className={CARD_WIDE}>
      <CardHeader title="Lunch Selection" sub={`Choose your dishes · ${total} ${total === 1 ? "person" : "people"}`} onBack={goBack} />
      <div className="px-7 pb-7 pt-5">
        {MENU_COURSES.map((course) => {
          const ct = courseTotal(course.id);
          const over = ct > total;
          return (
            <div key={course.id} className="mb-5">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wide text-secondary-900">{course.name}</div>
                <div className={"text-[11px] font-semibold " + (over ? "text-red-500" : "text-secondary-400")}>{ct}/{total}</div>
              </div>
              {course.options.map((opt) => {
                const qty = menu[course.id][opt.id];
                return (
                  <div key={opt.id} className="flex items-center border-b border-secondary-200 py-2.5">
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-secondary-900">{opt.name}</div>
                      <div className="mt-0.5 text-[11px] text-secondary-400">{opt.desc}</div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <button
                        onClick={() => updateQty(course.id, opt.id, -1)}
                        className={
                          "flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px] text-lg font-bold leading-none " +
                          (qty > 0 ? "cursor-pointer border-secondary-200 bg-white text-secondary-900" : "cursor-default border-neutral-100 bg-secondary-50 text-secondary-400")
                        }
                      >−</button>
                      <span className="w-[22px] text-center text-sm font-bold text-secondary-900">{qty}</span>
                      <button
                        onClick={() => updateQty(course.id, opt.id, 1)}
                        className={
                          "flex h-[30px] w-[30px] items-center justify-center rounded-full text-lg font-bold leading-none " +
                          (ct >= total ? "cursor-default bg-secondary-100 text-secondary-400" : "cursor-pointer bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-blue-glow")
                        }
                      >+</button>
                    </div>
                  </div>
                );
              })}
              {over && <div className="mt-1 text-[11px] font-semibold text-red-500">Max {total} per course</div>}
            </div>
          );
        })}

        <div className="mt-2 flex gap-2.5">
          {!loading ? (
            <>
              <button onClick={() => finish(null)} className="flex-1 cursor-pointer rounded-2xl border border-secondary-200 bg-secondary-100 py-3.5 text-sm font-semibold text-secondary-600">
                Skip
              </button>
              <button
                onClick={() => !isOver() && finish(menu)}
                disabled={isOver()}
                className={
                  "flex-[2] rounded-2xl py-3.5 text-sm font-bold " +
                  (isOver() ? "cursor-not-allowed bg-secondary-200 text-secondary-400" : "cursor-pointer bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-blue-glow")
                }
              >
                Confirm Selection
              </button>
            </>
          ) : <LoadingBtn />}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Balance (pay now / pay later) ────────────────────────────────────

function StepPay({ order, setOrder, goBack }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Processing");

  async function finish() {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`checkin1/${order.odoo_id}/${order.key}/save`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengers: order.passengers, email: order.email, menu: order.menu || null }),
      });
      if (!res.ok) throw new Error();
      window.location.href = "/checkin1/" + order.odoo_id + "/" + order.key + "/qr";
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  async function payOnline() {
    setLoading(true);
    setStatus("Saving");
    try {
      const saveRes = await fetch(apiUrl(`checkin1/${order.odoo_id}/${order.key}/save`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengers: order.passengers, email: order.email, menu: order.menu || null }),
      });
      if (!saveRes.ok) throw new Error();
      setStatus("Redirecting");
      const payRes = await fetch(apiUrl(`checkin1/${order.odoo_id}/${order.key}/pay`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: order.email }),
      });
      const json = await payRes.json();
      if (!payRes.ok || !json.payment_url) throw new Error();
      window.location.href = json.payment_url;
    } catch {
      setLoading(false);
      alert("Payment error. Please try again.");
    }
  }

  return (
    <div className={CARD}>
      <CardHeader title="Remaining Balance" onBack={goBack} />
      <div className="px-7 pb-7 pt-5">
        <div className="mb-1 border-b border-secondary-200 py-5 text-center">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-secondary-400">Amount due</div>
          <div className="text-[38px] font-extrabold leading-none tracking-tight text-primary-600">{fmtIDR(order.collect)}</div>
        </div>
        <RadioOpt
          label="Pay Online Now"
          sub={`Skip the morning queue · ${fmtIDR(order.collect)} + 2.5% Xendit fee`}
          checked={order.pay === true}
          onClick={() => setOrder((o) => ({ ...o, pay: true }))}
        />
        <RadioOpt
          label="Pay at the Office"
          sub="Cash or card on arrival at Serangan Harbor · No extra fee"
          checked={order.pay === false}
          onClick={() => setOrder((o) => ({ ...o, pay: false }))}
          last
        />
        <div className="mt-6">
          {!loading ? (
            order.pay === true ? (
              <PrimaryBtn onClick={payOnline}>Pay {fmtIDR(order.collect)} + 2.5% Xendit fee <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
            ) : (
              <PrimaryBtn onClick={finish}>Complete Check-In <ArrowRight className="h-[15px] w-[15px]" /></PrimaryBtn>
            )
          ) : <LoadingBtn text={status} />}
        </div>
      </div>
    </div>
  );
}

// ─── Page states: loading / not found ───────────────────────────────────────

function CenteredShell({ children }) {
  return (
    <div className="min-h-screen bg-secondary-100">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-3.5 shadow-[0_2px_16px_rgba(0,115,224,0.3)]">
        <img src="/themes/bluuu/assets/img/logo-white.svg" alt="Bluuu" className="block h-[26px]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">Online Check-In</span>
      </div>
      <div className="flex flex-col items-center px-4 pb-20 pt-7">{children}</div>
    </div>
  );
}

function NotFoundCard() {
  return (
    <div className={CARD + " px-7 py-10 text-center"}>
      <div className="mb-2 text-lg font-bold text-secondary-900">Order not found</div>
      <div className="text-sm text-secondary-400">This check-in link is invalid or the order has been cancelled.</div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Checkin1({ odooId, uniqueKey }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState(null);
  const [step, setStepRaw] = useState("overview");

  useEffect(() => {
    if (!odooId || !uniqueKey) { setNotFound(true); setLoading(false); return; }

    const params = new URLSearchParams(window.location.search);
    let cancelled = false;

    fetch(apiUrl(`checkin1/${odooId}/${uniqueKey}`))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data.expired) {
          setOrder({ ...data, key: uniqueKey });
          setLoading(false);
          return;
        }
        if (data.already_checked_in || params.get("paid") === "1") {
          window.location.href = "/checkin1/" + odooId + "/" + uniqueKey + "/qr";
          return;
        }
        setOrder({
          ...data,
          key: uniqueKey,
          passengers: [],
          pay: false,
          menu: null,
        });
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
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

  if (notFound || !order) {
    return (
      <CenteredShell>
        <NotFoundCard />
      </CenteredShell>
    );
  }

  if (order.expired) {
    return (
      <CenteredShell>
        <SeeYouAgain name={order.name} />
      </CenteredShell>
    );
  }

  const steps = buildVisibleSteps(order);
  const idx = steps.indexOf(step);
  const prevStep = idx > 0 ? steps[idx - 1] : null;
  const nextStep = idx < steps.length - 1 ? steps[idx + 1] : null;

  function go(s) {
    if (!s) return;
    setStepRaw(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const props = {
    order,
    setOrder,
    goBack: () => go(prevStep),
    goNext: () => go(nextStep),
    nextStep,
    go,
  };

  const regStep = (key) => order.reg[key];

  return (
    <CenteredShell>
      <Stepper total={steps.length} current={idx + 1} />
      {step === "overview" && <StepOverview {...props} />}
      {step === "intro" && <StepRegIntro {...props} />}
      {step === "video" && <StepRegVideo {...props} />}
      {step === "meet" && <StepRegMeet {...props} />}
      {step === "info4" && <StepRegInfo {...props} reg={regStep("s4")} />}
      {step === "info5" && <StepRegInfo {...props} reg={regStep("s5")} />}
      {step === "info6" && <StepRegInfo {...props} reg={regStep("s6")} />}
      {step === "info7" && <StepRegInfo {...props} reg={regStep("s7")} />}
      {step === "info8" && <StepRegInfo {...props} reg={regStep("s8")} />}
      {step === "passengers" && <StepPassengers {...props} />}
      {step === "menu" && <StepMenu {...props} />}
      {step === "balance" && <StepPay {...props} />}
    </CenteredShell>
  );
}
