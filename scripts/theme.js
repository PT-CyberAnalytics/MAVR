const THEME_KEY = "mavr_theme";
const root = document.documentElement;

function preferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "light";
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
}

applyTheme(preferredTheme());

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(root.dataset.theme || preferredTheme());

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
});
