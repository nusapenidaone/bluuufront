import React, { useEffect, useState, useCallback } from "react";

const TOKEN_KEY = "bluuu_admin_token";

// ─── Odoo fields that can be edited directly ──────────────────────────────

const ODOO_FIELD_GROUPS = [
  {
    label: "Dates",
    cols: 2,
    fields: [
      { key: "rental_start_date",  label: "Start (date + time)", type: "datetime-local" },
      { key: "rental_return_date", label: "End (date + time)",   type: "datetime-local" },
    ],
  },
  {
    label: "Passengers",
    cols: 3,
    fields: [
      { key: "x_studio_adults",           label: "Adults",  type: "number" },
      { key: "x_studio_kids",             label: "Kids",    type: "number" },
      { key: "x_studio_count_of_people",  label: "Members (total)", type: "number" },
    ],
  },
  {
    label: "Trip",
    cols: 2,
    fields: [
      { key: "x_studio_boat_name", label: "Boat name", type: "text" },
      { key: "x_studio_route",     label: "Route",     type: "text" },
    ],
  },
  {
    label: "Transfer",
    cols: 2,
    fields: [
      { key: "x_studio_pickup_address",   label: "Pickup address",  type: "text" },
      { key: "x_studio_drop_off_address", label: "Dropoff address", type: "text" },
      { key: "x_studio_pickup_cars",      label: "Pickup cars",     type: "number" },
      { key: "x_studio_drop_off_cars",    label: "Dropoff cars",    type: "number" },
    ],
  },
  {
    label: "Payment",
    cols: 2,
    fields: [
      { key: "x_studio_deposit", label: "Deposit",  type: "number" },
      { key: "x_studio_collect", label: "Collect",  type: "number" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return "—";
  return str.slice(0, 10);
}

function fmtDateTime(str) {
  if (!str) return "";
  // Odoo returns "2026-05-10 08:00:00" — convert to datetime-local format
  return str.replace(" ", "T").slice(0, 16);
}

function StateBadge({ state }) {
  const cls = {
    sale:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft:  "bg-amber-50 text-amber-700 border-amber-200",
    cancel: "bg-rose-50 text-rose-600 border-rose-200",
  }[state] ?? "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {state ?? "—"}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className="text-right text-xs font-medium text-slate-700">{value ?? "—"}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function LeadAdmin() {
  const [token, setToken]           = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [tokenInput, setTokenInput] = useState("");

  const [view, setView] = useState("list"); // "list" | "detail"

  // List state
  const [orders, setOrders]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError]   = useState("");

  // Detail state
  const [odoo, setOdoo]             = useState(null);   // live Odoo data
  const [local, setLocal]           = useState(null);   // linked local order (may be null)
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState("");
  const [form, setForm]             = useState({});     // edit form values
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [recreating, setRecreating] = useState(false);
  const [recreateResult, setRecreateResult] = useState(null);
  const [actionError, setActionError]       = useState("");

  // ─── API helper ─────────────────────────────────────────────────────────

  const adminFetch = useCallback(async (path, options = {}) => {
    const res = await fetch(`/api/admin/${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }, [token]);

  // ─── Auth ───────────────────────────────────────────────────────────────

  const handleLogin = () => {
    const t = tokenInput.trim();
    if (!t) return;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOrders([]);
  };

  // ─── Load list from Odoo ─────────────────────────────────────────────────

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    setListError("");
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (search.trim()) params.set("search", search.trim());
      const data = await adminFetch(`odoo/orders?${params}`);
      setOrders(data.data || []);
      setPagination(data);
    } catch (e) {
      setListError(e.message);
    } finally {
      setListLoading(false);
    }
  }, [token, page, search, adminFetch]);

  useEffect(() => {
    if (token && view === "list") loadOrders();
  }, [token, view, page]); // eslint-disable-line

  // ─── Load single order from Odoo ─────────────────────────────────────────

  const loadOrder = async (odooId) => {
    setView("detail");
    setDetailLoading(true);
    setDetailError("");
    setSaveStatus(null);
    setRecreateResult(null);
    setActionError("");
    try {
      const data = await adminFetch(`odoo/order/${odooId}`);
      setOdoo(data.odoo);
      setLocal(data.order);
      // Pre-fill edit form from Odoo data
      const filled = {};
      ODOO_FIELD_GROUPS.forEach(g =>
        g.fields.forEach(f => {
          const val = data.odoo?.[f.key];
          filled[f.key] = f.type === "datetime-local" ? fmtDateTime(val) : (val ?? "");
        })
      );
      setForm(filled);
    } catch (e) {
      setDetailError(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadOdoo = async (odooId) => {
    try {
      const data = await adminFetch(`odoo/order/${odooId}`);
      setOdoo(data.odoo);
      setLocal(data.order);
    } catch (_) {}
  };

  // ─── Save to Odoo ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      // Convert form values to Odoo-compatible types before sending
      const payload = {};
      ODOO_FIELD_GROUPS.forEach(g =>
        g.fields.forEach(f => {
          const val = form[f.key];
          if (val === "" || val == null) return;
          if (f.type === "datetime-local") {
            // "2026-05-10T08:00" → "2026-05-10 08:00:00"
            payload[f.key] = val.replace("T", " ") + ":00";
          } else if (f.type === "number") {
            payload[f.key] = Number(val);
          } else {
            payload[f.key] = val;
          }
        })
      );

      const data = await adminFetch(`odoo/order/${odoo.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setOdoo(data.odoo);
      // Refresh form from updated Odoo data
      const refreshed = {};
      ODOO_FIELD_GROUPS.forEach(g =>
        g.fields.forEach(f => {
          const v = data.odoo?.[f.key];
          refreshed[f.key] = f.type === "datetime-local" ? fmtDateTime(v) : (v ?? "");
        })
      );
      setForm(refreshed);
      setSaveStatus({ ok: true, msg: "Saved to Odoo" });
    } catch (e) {
      setSaveStatus({ ok: false, msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  // ─── Recreate (cancel + new) ─────────────────────────────────────────────
  // Used when products need to change — requires a linked local order

  const handleRecreate = async () => {
    if (!window.confirm("Cancel the current Odoo order and create a new one from local data?")) return;
    setRecreating(true);
    setRecreateResult(null);
    setActionError("");
    try {
      const data = await adminFetch(`odoo/order/${odoo.id}/recreate`, { method: "POST" });
      setRecreateResult(data.result);
      // Load the new Odoo order
      await reloadOdoo(data.result.new_odoo_id);
    } catch (e) {
      setActionError(e.message);
    } finally {
      setRecreating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Login
  // ─────────────────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Admin</div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Lead Manager</h1>
          <div className="mt-6 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Bearer token</span>
              <input
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="adm_bluuu_…"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </label>
            <button
              onClick={handleLogin}
              className="h-11 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Orders list (from Odoo)
  // ─────────────────────────────────────────────────────────────────────────

  if (view === "list") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">

          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Admin · Odoo</div>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">Lead Manager</h1>
            </div>
            <button onClick={handleLogout} className="mt-2 text-xs text-slate-400 hover:text-slate-700">
              Sign out
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={e => e.key === "Enter" && loadOrders()}
              placeholder="Search by name, email, boat, external ID…"
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
            <button
              onClick={loadOrders}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Search
            </button>
          </div>

          {listError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {listError}
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {listLoading ? (
              <div className="py-16 text-center text-sm text-slate-400">Loading from Odoo…</div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3">Odoo #</th>
                      <th className="px-4 py-3">Ref</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Boat</th>
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">People</th>
                      <th className="px-4 py-3">Deposit</th>
                      <th className="px-4 py-3">Collect</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const partner = Array.isArray(o.partner_id) ? o.partner_id[1] : o.partner_id;
                      return (
                        <tr key={o.id} className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">#{o.id}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.client_order_ref || o.name}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{partner}</td>
                          <td className="px-4 py-3 text-slate-500">{fmtDate(o.rental_start_date)}</td>
                          <td className="px-4 py-3 text-slate-600">{o.x_studio_boat_name || "—"}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-[120px] truncate">{o.x_studio_route || "—"}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{o.x_studio_count_of_people ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">${o.x_studio_deposit ?? 0}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">${o.x_studio_collect ?? 0}</td>
                          <td className="px-4 py-3"><StateBadge state={o.state} /></td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => loadOrder(o.id)}
                              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Page {pagination.current_page} of {pagination.last_page} · {pagination.total} orders</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50">Prev</button>
                <button disabled={page >= pagination.last_page} onClick={() => setPage(p => p + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Order detail
  // ─────────────────────────────────────────────────────────────────────────

  if (detailLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400">Loading from Odoo…</div>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 flex-col gap-3">
        <div className="text-sm text-rose-600">{detailError}</div>
        <button onClick={() => setView("list")} className="text-sm text-slate-500 hover:text-slate-900">← Back</button>
      </div>
    );
  }

  const partnerName = Array.isArray(odoo?.partner_id) ? odoo.partner_id[1] : odoo?.partner_id;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => { setView("list"); loadOrders(); }}
            className="text-sm text-slate-400 transition hover:text-slate-900"
          >
            ← Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">Odoo #{odoo?.id}</span>
              {odoo?.client_order_ref && (
                <span className="font-mono text-xs text-slate-400">· {odoo.client_order_ref}</span>
              )}
              <StateBadge state={odoo?.state} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">{partnerName}</h1>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Left: edit form ──────────────────────────────────────────── */}
          <div className="space-y-5 lg:col-span-2">
            {ODOO_FIELD_GROUPS.map(group => (
              <div key={group.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-sm font-semibold text-slate-900">{group.label}</div>
                <div className={`grid gap-3 ${group.cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                  {group.fields.map(f => (
                    <label key={f.key} className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-slate-400">{f.label}</span>
                      <input
                        type={f.type}
                        value={form[f.key] ?? ""}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save to Odoo"}
              </button>

              {local && (
                <button
                  onClick={handleRecreate}
                  disabled={recreating}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  {recreating ? "Recreating…" : "Recreate order"}
                </button>
              )}

              {saveStatus && (
                <span className={`text-sm font-medium ${saveStatus.ok ? "text-emerald-600" : "text-rose-600"}`}>
                  {saveStatus.msg}
                </span>
              )}
            </div>

            {!local && (
              <p className="text-xs text-slate-400">
                "Recreate order" is available only when a local order is linked to this Odoo record.
              </p>
            )}

            {/* Recreate result */}
            {recreateResult && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 space-y-0.5">
                <div className="font-semibold">Order recreated</div>
                <div>Cancelled: #{recreateResult.cancelled_odoo_id}</div>
                <div>New Odoo ID: <b>#{recreateResult.new_odoo_id}</b></div>
              </div>
            )}
            {actionError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {actionError}
              </div>
            )}
          </div>

          {/* ── Right: Odoo summary ──────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Summary card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-slate-900">Summary</div>
              <div className="divide-y divide-slate-100">
                <InfoRow label="Customer" value={partnerName} />
                <InfoRow label="Boat"     value={odoo?.x_studio_boat_name} />
                <InfoRow label="Route"    value={odoo?.x_studio_route} />
                <InfoRow label="Start"    value={odoo?.rental_start_date?.slice(0, 16)} />
                <InfoRow label="End"      value={odoo?.rental_return_date?.slice(0, 16)} />
                <InfoRow label="Adults"   value={odoo?.x_studio_adults} />
                <InfoRow label="Kids"     value={odoo?.x_studio_kids} />
                <InfoRow label="Members"  value={odoo?.x_studio_count_of_people} />
                <InfoRow label="Pickup"   value={odoo?.x_studio_pickup_address} />
                <InfoRow label="Dropoff"  value={odoo?.x_studio_drop_off_address} />
              </div>
              <div className="mt-3 flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">Deposit</span>
                <span className="font-semibold text-slate-900">${odoo?.x_studio_deposit ?? 0}</span>
              </div>
              <div className="mt-1.5 flex justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm">
                <span className="text-amber-600">Collect</span>
                <span className="font-bold text-amber-700">${odoo?.x_studio_collect ?? 0}</span>
              </div>
            </div>

            {/* Order lines */}
            {odoo?.lines?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 text-sm font-semibold text-slate-900">Order lines</div>
                <div className="space-y-2">
                  {odoo.lines.map(line => (
                    <div key={line.id} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="flex-1 truncate">{line.name}</span>
                      <span className="shrink-0 text-slate-400">×{line.product_uom_qty}</span>
                      <span className="w-16 shrink-0 text-right font-semibold text-slate-900">
                        ${line.price_unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked local order */}
            {local && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-slate-900">Local order</div>
                <div className="divide-y divide-slate-100">
                  <InfoRow label="ID"    value={`#${local.id}`} />
                  <InfoRow label="Tour"  value={local.tours?.name} />
                  <InfoRow label="Boat"  value={local.boat?.name} />
                  <InfoRow label="Total" value={`$${local.total_price}`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
