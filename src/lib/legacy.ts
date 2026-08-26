/**
 * Exact original storage formats from the book.
 * Same browser ⇒ notes and shopping check-offs carry over seamlessly
 * between the HTML book and this app.
 *   'tbt-note-{page}' → raw string
 *   'tbt-shop-{page}' → JSON object { [ingredientName]: true }
 */
export function loadNote(page: number): string {
  try { return localStorage.getItem("tbt-note-" + page) || ""; } catch { return ""; }
}
export function saveNote(page: number, val: string): void {
  try { localStorage.setItem("tbt-note-" + page, val); window.dispatchEvent(new Event("tbt-dirty")); } catch { /* quota */ }
}
export function getShopChecks(page: number): Record<string, true> {
  try { return JSON.parse(localStorage.getItem("tbt-shop-" + page) || "{}"); } catch { return {}; }
}
export function saveShopCheck(page: number, name: string, checked: boolean): void {
  try {
    const data = getShopChecks(page);
    if (checked) data[name] = true; else delete data[name];
    localStorage.setItem("tbt-shop-" + page, JSON.stringify(data)); window.dispatchEvent(new Event("tbt-dirty"));
  } catch { /* quota */ }
}
export function clearShopChecks(page: number): void {
  try { localStorage.removeItem("tbt-shop-" + page); window.dispatchEvent(new Event("tbt-dirty")); } catch { /* noop */ }
}
