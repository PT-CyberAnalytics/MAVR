/**
 * i18n.js  –  i18next wrapper for MAVR
 *
 * Responsibilities:
 *  - Lazy-loads lang/en.json / lang/ru.json on demand
 *  - Falls back to English for any missing key
 *  - Exposes t(), setLanguage(), currentLang, SUPPORTED_LANGS
 *  - Fires a custom `languageChanged` event on <html> after every switch
 */

import i18next from "./i18next.js";

export const SUPPORTED_LANGS = ["en", "ru"];
export const DEFAULT_LANG = "en";

/* ── lazy resource loader ───────────────────────────────────── */
const cache = {};

async function loadResources(lang) {
  if (cache[lang]) return cache[lang];
  const res = await fetch(`./lang/${lang}.json`);
  if (!res.ok) throw new Error(`Failed to load lang/${lang}.json`);
  cache[lang] = await res.json();
  return cache[lang];
}

/* ── initialise i18next ──────────────────────────────────────── */
async function init(lang) {
  const [primary, fallback] = await Promise.all([
    loadResources(lang),
    lang !== DEFAULT_LANG ? loadResources(DEFAULT_LANG) : Promise.resolve(null),
  ]);

  await i18next.init({
    lng: lang,
    fallbackLng: DEFAULT_LANG,
    resources: {
      [lang]: { translation: primary },
      ...(fallback ? { [DEFAULT_LANG]: { translation: fallback } } : {}),
    },
    interpolation: { escapeValue: false },
  });
}

/* ── public API ──────────────────────────────────────────────── */

/** Translate a dot-notation key, optional i18next options */
export function t(key, options) {
  return i18next.t(key, options);
}

/** Currently active language code */
export function currentLang() {
  return i18next.language || DEFAULT_LANG;
}

/**
 * Switch to a new language at runtime.
 * Lazy-loads the JSON if not already cached.
 * Returns a Promise that resolves when the switch is complete.
 */
export async function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    console.warn(`[i18n] Unsupported language: ${lang}`);
    return;
  }

  // Add resources if not already registered
  if (!i18next.hasResourceBundle(lang, "translation")) {
    const resources = await loadResources(lang);
    i18next.addResourceBundle(lang, "translation", resources, true, true);
  }

  await i18next.changeLanguage(lang);

  // Persist choice
  localStorage.setItem("mavr_lang", lang);

  // Update <html> attributes
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr"; // extend here for RTL languages

  // Fire event so any listener can re-render
  document.dispatchEvent(
    new CustomEvent("languageChanged", { detail: { lang } }),
  );
}

/* ── bootstrap ───────────────────────────────────────────────── */
const savedLang = localStorage.getItem("mavr_lang");
const startLang = SUPPORTED_LANGS.includes(savedLang)
  ? savedLang
  : DEFAULT_LANG;

export const i18nReady = init(startLang).then(() => {
  document.documentElement.lang = startLang;
  localStorage.setItem("mavr_lang", startLang);
});
