import React, { useEffect, useState } from "react";
import { apiUrl } from "./api/base";

export default function PricingAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [defaultPrice, setDefaultPrice] = useState(110);
  const [seasons, setSeasons] = useState([]);
  const [capacityRows, setCapacityRows] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch(apiUrl("pricing?all=1"));
      if (!res.ok) throw new Error("Failed to load pricing");
      const data = await res.json();
      setDefaultPrice(Number(data?.defaultPrice) || 110);
      setSeasons(Array.isArray(data?.seasons) ? data.seasons : []);
      const rows = Object.entries(data?.dateCapacity || {})
        .map(([date, remainingSeats]) => ({
          date,
          remainingSeats: Number(remainingSeats),
        }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
      setCapacityRows(rows);
    } catch (err) {
      setError(err?.message || "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateSeason = (idx, key, value) => {
    setSeasons((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );
  };

  const addSeason = () => {
    setSeasons((prev) => [...prev, { start: "", end: "", price: "" }]);
  };

  const removeSeason = (idx) => {
    setSeasons((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCapacity = (idx, key, value) => {
    setCapacityRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );
  };

  const addCapacity = () => {
    setCapacityRows((prev) => [...prev, { date: "", remainingSeats: "" }]);
  };

  const removeCapacity = (idx) => {
    setCapacityRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    setStatus("");
    const dateCapacity = capacityRows.reduce((acc, row) => {
      if (!row.date) return acc;
      const value = Number(row.remainingSeats);
      if (Number.isFinite(value)) {
        acc[row.date] = Math.max(0, value);
      }
      return acc;
    }, {});
    const payload = {
      defaultPrice: Number(defaultPrice) || 0,
      seasons: seasons
        .filter((s) => s?.start && s?.end && s?.price !== "")
        .map((s) => ({
          start: s.start,
          end: s.end,
          price: Number(s.price),
        })),
      dateCapacity,
    };

    try {
      const res = await fetch(apiUrl("pricing"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save pricing");
      if (data?.storage === "kv") {
        setStatus("Saved to KV");
      } else if (data?.storage === "file") {
        setStatus("Saved locally");
      } else {
        setStatus(data?.warning || "Saved (memory only)");
      }
    } catch (err) {
      setError(err?.message || "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</div>
          <h1 className="mt-2 text-3xl font-semibold">Pricing manager</h1>
          <p className="mt-2 text-sm text-slate-600">
            Update the base price, seasonal prices, and remaining seats per date.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Base price</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-600">Default price (USD)</span>
                <input
                  type="number"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Seasonal pricing</div>
              <button
                type="button"
                onClick={addSeason}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Add season
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {seasons.length === 0 ? (
                <div className="text-sm text-slate-500">No seasons yet.</div>
              ) : null}
              {seasons.map((row, idx) => (
                <div key={`${row.start}-${row.end}-${idx}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-10">
                  <label className="flex flex-col gap-2 sm:col-span-3">
                    <span className="text-xs font-semibold text-slate-600">Start</span>
                    <input
                      type="date"
                      value={row.start || ""}
                      onChange={(e) => updateSeason(idx, "start", e.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                  <label className="flex flex-col gap-2 sm:col-span-3">
                    <span className="text-xs font-semibold text-slate-600">End</span>
                    <input
                      type="date"
                      value={row.end || ""}
                      onChange={(e) => updateSeason(idx, "end", e.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                  <label className="flex flex-col gap-2 sm:col-span-3">
                    <span className="text-xs font-semibold text-slate-600">Price (USD)</span>
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => updateSeason(idx, "price", e.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                  <div className="flex items-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeSeason(idx)}
                      className="h-10 w-full rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Remaining seats per date</div>
              <button
                type="button"
                onClick={addCapacity}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Add date
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {capacityRows.length === 0 ? (
                <div className="text-sm text-slate-500">No dates yet.</div>
              ) : null}
              {capacityRows.map((row, idx) => (
                <div key={`${row.date}-${idx}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-10">
                  <label className="flex flex-col gap-2 sm:col-span-5">
                    <span className="text-xs font-semibold text-slate-600">Date</span>
                    <input
                      type="date"
                      value={row.date || ""}
                      onChange={(e) => updateCapacity(idx, "date", e.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                  <label className="flex flex-col gap-2 sm:col-span-4">
                    <span className="text-xs font-semibold text-slate-600">Remaining seats</span>
                    <input
                      type="number"
                      value={row.remainingSeats}
                      onChange={(e) => updateCapacity(idx, "remainingSeats", e.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                    />
                  </label>
                  <div className="flex items-end sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeCapacity(idx)}
                      className="h-10 w-full rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Refresh
          </button>
          {loading ? <div className="text-sm text-slate-500">Loading...</div> : null}
          {status ? <div className="text-sm text-emerald-600">{status}</div> : null}
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
