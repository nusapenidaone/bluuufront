import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "pricing.json");
const DEFAULT_DATA = {
  defaultPrice: 110,
  seasons: [],
  dateCapacity: {},
};
let memoryData = null;
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "pricing:data";
const hasKv = Boolean(KV_URL && KV_TOKEN);

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function readData() {
  if (memoryData) return memoryData;
  if (hasKv) {
    try {
      const res = await fetch(`${KV_URL}/get/${encodeURIComponent(KV_KEY)}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
      const payload = await res.json();
      if (res.ok && payload?.result) {
        const parsed = JSON.parse(payload.result);
        memoryData = {
          ...DEFAULT_DATA,
          ...parsed,
          dateCapacity: { ...DEFAULT_DATA.dateCapacity, ...parsed?.dateCapacity },
        };
        return memoryData;
      }
    } catch (_) {}
  }
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    memoryData = {
      ...DEFAULT_DATA,
      ...parsed,
      dateCapacity: { ...DEFAULT_DATA.dateCapacity, ...parsed?.dateCapacity },
    };
    return memoryData;
  } catch (_) {
    memoryData = { ...DEFAULT_DATA };
    return memoryData;
  }
}

async function writeData(data) {
  memoryData = data;
  let kvSaved = false;
  let fileSaved = false;

  if (hasKv) {
    try {
      const payload = encodeURIComponent(JSON.stringify(data));
      const res = await fetch(`${KV_URL}/set/${encodeURIComponent(KV_KEY)}/${payload}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
      kvSaved = res.ok;
    } catch (_) {}
  }

  try {
    const serialized = JSON.stringify(data, null, 2);
    await writeFile(DATA_PATH, serialized, "utf8");
    fileSaved = true;
  } catch (_) {}

  return {
    persisted: kvSaved || fileSaved,
    storage: kvSaved ? "kv" : fileSaved ? "file" : "memory",
  };
}

function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toTimestamp(value) {
  return new Date(`${value}T00:00:00Z`).getTime();
}

function getSeasonPrice(dateStr, seasons, fallback) {
  if (!isDateString(dateStr) || !Array.isArray(seasons)) return fallback;
  const dateTs = toTimestamp(dateStr);
  for (const season of seasons) {
    if (!isDateString(season?.start) || !isDateString(season?.end)) continue;
    const startTs = toTimestamp(season.start);
    const endTs = toTimestamp(season.end);
    if (!Number.isFinite(startTs) || !Number.isFinite(endTs)) continue;
    if (dateTs >= startTs && dateTs <= endTs) {
      const price = Number(season.price);
      return Number.isFinite(price) ? price : fallback;
    }
  }
  return fallback;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (req.body && typeof req.body === "string") return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export default async function handler(req, res) {
  const method = req.method || "GET";
  const url = new URL(req.url, `http://${req.headers.host}`);
  const date = url.searchParams.get("date");
  const all = url.searchParams.get("all");

  if (method === "GET") {
    const data = await readData();
    if (all === "1") {
      return sendJson(res, 200, data);
    }
    const price = getSeasonPrice(date, data.seasons, data.defaultPrice);
    let remainingSeats = null;
    if (isDateString(date) && Object.prototype.hasOwnProperty.call(data.dateCapacity, date)) {
      const value = Number(data.dateCapacity[date]);
      remainingSeats = Number.isFinite(value) ? Math.max(0, value) : null;
    }
    return sendJson(res, 200, { date, price, remainingSeats });
  }

  if (method === "POST") {
    try {
      const body = await readBody(req);
      const data = await readData();
      const next = { ...data };

      if (Number.isFinite(Number(body?.defaultPrice))) {
        next.defaultPrice = Number(body.defaultPrice);
      }
      if (Array.isArray(body?.seasons)) {
        next.seasons = body.seasons;
      }
      if (body?.dateCapacity && typeof body.dateCapacity === "object") {
        next.dateCapacity = { ...next.dateCapacity, ...body.dateCapacity };
      }
      if (isDateString(body?.date) && body?.remainingSeats !== undefined) {
        const value = Number(body.remainingSeats);
        next.dateCapacity = {
          ...next.dateCapacity,
          [body.date]: Number.isFinite(value) ? Math.max(0, value) : body.remainingSeats,
        };
      }

      const writeResult = await writeData(next);
      return sendJson(res, 200, {
        ...next,
        persisted: writeResult.persisted,
        storage: writeResult.storage,
        warning: writeResult.persisted
          ? undefined
          : "Pricing saved in memory only. Configure KV for persistent storage.",
      });
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body", details: String(error?.message || error) });
    }
  }

  return sendJson(res, 405, { error: "Method not allowed" });
}
