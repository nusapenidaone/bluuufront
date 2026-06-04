import { useEffect, useState } from "react";
import { apiUrl } from "../api/base";

// ── WhatsApp routing by utm_source ───────────────────────────────────────────
// number — E.164 без + (для wa.me)
// message — pre-filled текст (plain, не encoded)
// Default используется когда utm_source не задан или не в списке
const WA_DEFAULT = {
  number:  "6281547483381",
  message: "Hi Bluuu! I want to book a tour [G]",
};

const UTM_WHATSAPP_MAP = {
  meta:    { number: "628213845159",  message: "Hi Bluuu! I want to book a tour [M]" },
  tiktok:  { number: "628214097657",  message: "Hi Bluuu! I just submitted my inquiry [T]" },
  google:  { number: "6281547483381", message: "Hi Bluuu! I want to book a tour [G]" },
};
// ─────────────────────────────────────────────────────────────────────────────

function buildWaEntry({ number, message }) {
  const link = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return { number: `+${number}`, link };
}

function getUtmWhatsapp() {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = (params.get("utm_source") || "").toLowerCase().trim();
    const entry = UTM_WHATSAPP_MAP[source] || WA_DEFAULT;
    return buildWaEntry(entry);
  } catch (_) {}
  return buildWaEntry(WA_DEFAULT);
}

const DEFAULT_CONTACTS = {
  address: "",
  location: "",
  phone: {
    number: "",
    link: "",
  },
  whatsapp: {
    number: "",
    link: "",
  },
  email: "",
  facebook: "",
  youtube: "",
  instagram: "",
  map: "",
};

function normalizeContacts(raw) {
  if (!raw || typeof raw !== "object") return DEFAULT_CONTACTS;

  const phone = raw.phone && typeof raw.phone === "object" ? raw.phone : {};
  const whatsapp = raw.whatsapp && typeof raw.whatsapp === "object" ? raw.whatsapp : {};

  return {
    address: typeof raw.address === "string" && raw.address.trim() ? raw.address : DEFAULT_CONTACTS.address,
    location: typeof raw.location === "string" && raw.location.trim() ? raw.location : DEFAULT_CONTACTS.location,
    phone: {
      number: typeof phone.number === "string" && phone.number.trim() ? phone.number : DEFAULT_CONTACTS.phone.number,
      link: typeof phone.link === "string" && phone.link.trim() ? phone.link : DEFAULT_CONTACTS.phone.link,
    },
    whatsapp: {
      number: typeof whatsapp.number === "string" && whatsapp.number.trim() ? whatsapp.number : DEFAULT_CONTACTS.whatsapp.number,
      link: typeof whatsapp.link === "string" && whatsapp.link.trim() ? whatsapp.link : DEFAULT_CONTACTS.whatsapp.link,
    },
    email: typeof raw.email === "string" && raw.email.trim() ? raw.email : DEFAULT_CONTACTS.email,
    facebook: typeof raw.facebook === "string" ? raw.facebook : DEFAULT_CONTACTS.facebook,
    youtube: typeof raw.youtube === "string" && raw.youtube.trim() ? raw.youtube : DEFAULT_CONTACTS.youtube,
    instagram: typeof raw.instagram === "string" && raw.instagram.trim() ? raw.instagram : DEFAULT_CONTACTS.instagram,
    map: typeof raw.map === "string" ? raw.map : DEFAULT_CONTACTS.map,
  };
}

function extractContactsFromSettings(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.contacts && typeof payload.contacts === "object") return payload.contacts;
  if (payload.value && typeof payload.value === "object" && payload.value.contacts && typeof payload.value.contacts === "object") {
    return payload.value.contacts;
  }
  return null;
}

let cachedContacts = null;
let pendingRequest = null;

async function fetchContactsFromApi() {
  const settingsRes = await fetch(apiUrl("settings"));
  if (settingsRes.ok) {
    const settingsData = await settingsRes.json();
    const settingsContacts = extractContactsFromSettings(settingsData);
    if (settingsContacts) return normalizeContacts(settingsContacts);
  }

  const contactsRes = await fetch(apiUrl("contacts"));
  if (contactsRes.ok) {
    const contactsData = await contactsRes.json();
    if (contactsData?.contacts) {
      return normalizeContacts(contactsData.contacts);
    }
  }

  throw new Error("Failed to load contacts");
}

function applyUtmOverride(contacts) {
  const utmWa = getUtmWhatsapp();
  return utmWa ? { ...contacts, whatsapp: utmWa } : contacts;
}

export function useSiteContacts() {
  const [contacts, setContacts] = useState(() => applyUtmOverride(cachedContacts || DEFAULT_CONTACTS));

  useEffect(() => {
    let cancelled = false;

    if (cachedContacts) {
      setContacts(applyUtmOverride(cachedContacts));
      return undefined;
    }

    if (!pendingRequest) {
      pendingRequest = fetchContactsFromApi()
        .then((data) => {
          cachedContacts = data;
          return data;
        })
        .catch(() => DEFAULT_CONTACTS)
        .finally(() => {
          pendingRequest = null;
        });
    }

    pendingRequest.then((data) => {
      if (cancelled) return;
      const utmWa = getUtmWhatsapp();
      setContacts(utmWa ? { ...data, whatsapp: utmWa } : data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return contacts;
}
