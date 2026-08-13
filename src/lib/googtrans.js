// UnifiedSwitcher/WelcomeModal write this cookie both scoped to the current
// host and to `.${hostname}` (Google Translate itself may rely on either),
// which on a real domain leaves two `googtrans` entries in document.cookie.
// A naive `split("; googtrans=")` expecting exactly one match then silently
// fails and reports "not set" — read via regex instead so duplicates don't matter.
export function getGoogTransLang() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1] || "");
  const lang = value.split("/").pop();
  return lang || null;
}

export function setGoogTransLang(code) {
  const value = code === "en" ? "" : `/en/${code}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=.${window.location.hostname}`;
}
