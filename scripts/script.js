import {
  t,
  currentLang,
  setLanguage,
  i18nReady,
  SUPPORTED_LANGS,
} from "./i18n.js";

/* ── Scoring tables (unchanged logic) ───────────────────────── */
const scores = {
  as: { R: 10, A: 6, S: 5, P: 0 },
  ar: { N: 10, L: 5, H: 0 },
  ui: { N: 10, R: 3 },
  c: { H: 10, L: 3, I: 1, N: 0 },
  ia: { H: 10, L: 3, N: 0 },
};
const weights = { as: 0.22, ar: 0.23, ui: 0.15, c: 0.15, i: 0.15, a: 0.1 };
const multipliers = { os: 0.8, cf: 1.15, ci: 0.79 };

/* ── Helpers ─────────────────────────────────────────────────── */
function getVal(name, def = null) {
  return $(`input[name="${name}"]:checked`).val() ?? def;
}

function showToast(msg) {
  $("#copy-toast").text(msg).addClass("show");
  setTimeout(() => $("#copy-toast").removeClass("show"), 1800);
}

/* ── Render all translatable UI strings ─────────────────────── */
function renderUI() {
  // <html> lang + <title> + <meta description>
  document.title = t("meta.title");
  $('meta[name="description"]').attr("content", t("meta.description"));

  // Nav
  $('[data-i18n="nav.main"]').text(t("nav.main"));
  $('[data-i18n="nav.description"]').text(t("nav.description"));
  $('[data-i18n="nav.examples"]').text(t("nav.examples"));

  // Section headings & info bar
  $("#faq-top-block").text(t("faq_top_block"));
  $("#required-title").text(t("required_title"));
  $("#additional-title").text(t("additional_title"));
  $("#om-title")
    .text(t("om_title"))
    .attr("title", t("metrics.as.title_tooltip")); // closest context
  $("#im-title").text(t("im_title"));
  $("#result-title").text(t("result_title"));
  $("#final-score-label").text(t("mavr_rating"));
  $("#vector-string-label").text(t("vector_string"));
  $(".copy-hint").text(t("click_to_copy"));

  // Buttons
  $("#copy-btn").text(t("copy"));
  $("#reset-button").text(t("reset")).attr("title", t("reset"));
  $("#parse-btn").text(t("parse_btn"));
  $("#share-btn").text("🔗 " + t("share_btn"));
  $("#vector-input-label").text(t("vector_input_label"));
  $("#vector-input").attr("placeholder", t("vector_input_placeholder"));
  $("#vector-input-error").text("");

  // Metric titles + tooltips
  const metricKeys = ["as", "ar", "ui", "c", "i", "a", "os", "cf"];
  metricKeys.forEach((m) => {
    $(`#${m}-title`)
      .text(t(`metrics.${m}.title`))
      .attr("title", t(`metrics.${m}.title_tooltip`));
  });

  // Metric value labels + tooltips
  const metricValues = {
    as: ["R", "A", "S", "P"],
    ar: ["N", "L", "H"],
    ui: ["N", "R"],
    c: ["H", "L", "I", "N"],
    i: ["H", "L", "N"],
    a: ["H", "L", "N"],
    os: ["X", "U", "S"],
    cf: ["X", "A", "N"],
  };

  Object.entries(metricValues).forEach(([metric, vals]) => {
    vals.forEach((v) => {
      const key = `metrics.${metric}.${v}`;
      $(`#${metric}-${v.toLowerCase()}-label`)
        .text(t(`${key}.label`))
        .attr("title", t(`${key}.tooltip`));
    });
  });

  // Active lang button
  SUPPORTED_LANGS.forEach((lang) => {
    $(`#${lang}-btn`).toggleClass("active", lang === currentLang());
  });

  // Re-render score label in new language
  calculateScore();
}

/* ── Score calculation ───────────────────────────────────────── */
function calculateScore() {
  const asV = getVal("as", "R"),
    arV = getVal("ar", "N"),
    uiV = getVal("ui", "N");
  const cV = getVal("c", "N"),
    iV = getVal("i", "N"),
    aV = getVal("a", "N");
  const osV = getVal("os", null),
    cfV = getVal("cf", null);

  updateVector(asV, arV, uiV, cV, iV, aV, osV, cfV);

  if (cV === "N" && iV === "N" && aV === "N") {
    updateResult(0.0, "none");
    return;
  }

  let raw =
    weights.as * (scores.as[asV] || 0) +
    weights.ar * (scores.ar[arV] || 0) +
    weights.ui * (scores.ui[uiV] || 0) +
    weights.c * (scores.c[cV] || 0) +
    weights.i * (scores.ia[iV] || 0) +
    weights.a * (scores.ia[aV] || 0);

  let s = Math.round(Math.max(0.1, Math.min(10, raw)) * 10) / 10;
  if (osV === "U") s *= multipliers.os;
  if (cfV === "A") s *= multipliers.cf;
  if (cV === "I" && iV === "N" && aV === "N") s *= multipliers.ci;
  s = Math.round(Math.max(0.1, Math.min(10, s)) * 10) / 10;

  const level =
    s === 0
      ? "none"
      : s <= 4.9
        ? "low"
        : s <= 6.9
          ? "medium"
          : s <= 8.9
            ? "high"
            : "critical";

  updateResult(s, level);
}

function updateVector(as, ar, ui, c, i, a, os, cf) {
  let v = `MAVR:1.0/AS:${as}/AR:${ar}/UI:${ui}/C:${c}/I:${i}/A:${a}`;
  if (os && os !== "X") v += `/OS:${os}`;
  if (cf && cf !== "X") v += `/CF:${cf}`;
  $("#vector-container").text(v);
  updateHash(v);
}

function updateResult(score, level) {
  const label = t(`levels.${level}`);
  const classMap = {
    critical: "final-score-critical",
    high: "final-score-high",
    medium: "final-score-medium",
    low: "final-score-low",
    none: "final-score-none",
  };
  $("#final-score")
    .text(`${score} (${label})`)
    .attr("class", classMap[level] || "final-score-none");
}

/* ── Reset ───────────────────────────────────────────────────── */
function resetAll() {
  $('input[name="as"][value="R"]').prop("checked", true);
  $('input[name="ar"][value="N"]').prop("checked", true);
  $('input[name="ui"][value="N"]').prop("checked", true);
  $('input[name="c"][value="N"]').prop("checked", true);
  $('input[name="i"][value="N"]').prop("checked", true);
  $('input[name="a"][value="N"]').prop("checked", true);
  $('input[name="os"][value="X"]').prop("checked", true);
  $('input[name="cf"][value="X"]').prop("checked", true);
  calculateScore();
}

/* ── Parse vector string ─────────────────────────────────────── */
const VALID_VALUES = {
  as: ["R", "A", "S", "P"],
  ar: ["N", "L", "H"],
  ui: ["N", "R"],
  c: ["H", "L", "I", "N"],
  i: ["H", "L", "N"],
  a: ["H", "L", "N"],
  os: ["X", "U", "S"],
  cf: ["X", "A", "N"],
};

/**
 * parseVector(rawStr, silent)
 *   rawStr  – vector string to parse; if omitted reads #vector-input
 *   silent  – if true, no toast / no input state changes (used for URL boot)
 * Returns true on success, false on failure.
 */
function parseVector(rawStr, silent = false) {
  const raw = (rawStr !== undefined ? rawStr : $("#vector-input").val()).trim();
  const $err = $("#vector-input-error");
  const $inp = $("#vector-input");

  if (!silent) {
    $inp.removeClass("is-error is-success");
    $err.text("");
  }

  if (!raw) return false;

  const parts = raw.split("/");

  if (!parts[0].match(/^MAVR:\d(\.\d+)?$/i)) {
    if (!silent) setInputError(t("parse_error_format"));
    return false;
  }

  const map = {};
  for (let i = 1; i < parts.length; i++) {
    const sep = parts[i].indexOf(":");
    if (sep < 1) {
      if (!silent) setInputError(t("parse_error_format"));
      return false;
    }
    const key = parts[i].slice(0, sep).toLowerCase();
    const val = parts[i].slice(sep + 1).toUpperCase();
    map[key] = val;
  }

  const required = ["as", "ar", "ui", "c", "i", "a"];
  for (const m of required) {
    if (!map[m]) {
      if (!silent) setInputError(t("parse_error_format"));
      return false;
    }
    if (!VALID_VALUES[m].includes(map[m])) {
      if (!silent)
        setInputError(
          t("parse_error_value", { metric: m.toUpperCase(), value: map[m] }),
        );
      return false;
    }
  }

  for (const m of ["os", "cf"]) {
    if (map[m] && !VALID_VALUES[m].includes(map[m])) {
      if (!silent)
        setInputError(
          t("parse_error_value", { metric: m.toUpperCase(), value: map[m] }),
        );
      return false;
    }
  }

  $(`input[name="as"][value="${map.as}"]`).prop("checked", true);
  $(`input[name="ar"][value="${map.ar}"]`).prop("checked", true);
  $(`input[name="ui"][value="${map.ui}"]`).prop("checked", true);
  $(`input[name="c"][value="${map.c}"]`).prop("checked", true);
  $(`input[name="i"][value="${map.i}"]`).prop("checked", true);
  $(`input[name="a"][value="${map.a}"]`).prop("checked", true);
  $(`input[name="os"][value="${map.os || "X"}"]`).prop("checked", true);
  $(`input[name="cf"][value="${map.cf || "X"}"]`).prop("checked", true);

  if (!silent) {
    $inp.addClass("is-success");
    showToast(t("parse_success"));
    setTimeout(() => $inp.removeClass("is-success"), 2000);
  }

  calculateScore();
  return true;
}

function setInputError(msg) {
  $("#vector-input").addClass("is-error");
  $("#vector-input-error").text(msg);
}

/* ── URL hash sync ───────────────────────────────────────────── */
function updateHash(vector) {
  // Replace state so back-button doesn't cycle through every metric click
  history.replaceState(null, "", "#" + encodeURIComponent(vector));
}

function loadFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash) parseVector(hash, true);
}

/* ── Copy vector ─────────────────────────────────────────────── */
function copyVector() {
  const text = $("#vector-container").text();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => showToast(t("copied")));
}

/* ── Copy shareable URL ──────────────────────────────────────── */
function copyShareURL() {
  const vector = $("#vector-container").text();
  if (!vector) return;
  const url =
    window.location.origin +
    window.location.pathname +
    "#" +
    encodeURIComponent(vector);
  navigator.clipboard.writeText(url).then(() => showToast(t("share_copied")));
}

/* ── Language switch with fade transition ────────────────────── */
async function switchLang(lang) {
  const $content = $(".page-content");
  await $content.animate({ opacity: 0 }, 150).promise();
  await setLanguage(lang); // loads JSON, calls i18next.changeLanguage
  renderUI();
  $content.animate({ opacity: 1 }, 200);
}

/* ── Boot ────────────────────────────────────────────────────── */
$(async function () {
  // Wait for i18next to be ready before touching the DOM
  await i18nReady;

  // Wire up events
  $('input[type="radio"]').on("change", calculateScore);
  $("#reset-button").on("click", resetAll);
  $("#parse-btn").on("click", () => parseVector());
  $("#vector-input").on("keydown", (e) => {
    if (e.key === "Enter") parseVector();
  });
  $("#copy-btn").on("click", copyVector);
  $("#vector-display-wrap").on("click", copyVector);

  SUPPORTED_LANGS.forEach((lang) => {
    $(`#${lang}-btn`).on("click", () => switchLang(lang));
  });

  // Listen for languageChanged (fired by i18n.js) in case other
  // modules or future features trigger a language change directly
  document.addEventListener("languageChanged", renderUI);

  // Parse vector from URL hash if present (before first render)
  loadFromHash();

  // Share button
  $("#share-btn").on("click", copyShareURL);

  // Keep hash in sync if user navigates back/forward
  window.addEventListener("hashchange", () => {
    loadFromHash();
    renderUI();
  });

  // Initial render
  renderUI();
});
