import { jsPDF } from "jspdf";
import type { OccasionData, UnitSystem } from "../data/types";
import { buildShoppingList } from "../engine/shoppingList";
import { planBackwards, durText } from "../engine/planner";
import { fmtTime, fmtOven } from "../engine/format";
import { CORMORANT_600, JOSEFIN_600, LATO_400 } from "./pdfFonts";

/**
 * Phase 5 — the Kitchen Pack: menu card, day plan and shopping list as
 * one branded A4 PDF, set in the book's own typography.
 * This module is lazy-loaded (fonts ≈ 190 KB) — see Recipe.tsx.
 */

const NAVY = "#0D1B2A";
const GOLD = "#C9A84C";
const INK_SOFT = "#7A6E66";
const BURG = "#6B1E3A";
const GOLD_DIM = "#A8893C";

const PAGE_W = 210;
const MARGIN = 22;

function accentOf(occ: OccasionData): string {
  return occ.tier === "around-the-table" ? BURG : GOLD_DIM;
}

function newDoc(): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("Cormorant-600.ttf", CORMORANT_600);
  doc.addFont("Cormorant-600.ttf", "Cormorant", "normal");
  doc.addFileToVFS("Josefin-600.ttf", JOSEFIN_600);
  doc.addFont("Josefin-600.ttf", "Josefin", "normal");
  doc.addFileToVFS("Lato-400.ttf", LATO_400);
  doc.addFont("Lato-400.ttf", "Lato", "normal");
  return doc;
}

function eyebrow(doc: jsPDF, text: string, y: number, color = INK_SOFT): void {
  doc.setFont("Josefin", "normal").setFontSize(8).setTextColor(color);
  doc.text(text.toUpperCase(), PAGE_W / 2, y, { align: "center", charSpace: 1.6 });
}

function goldRule(doc: jsPDF, y: number, width = 46): void {
  doc.setDrawColor(GOLD).setLineWidth(0.4);
  doc.line((PAGE_W - width) / 2, y, (PAGE_W + width) / 2, y);
}

function footerMark(doc: jsPDF): void {
  doc.setFont("Josefin", "normal").setFontSize(7).setTextColor(GOLD_DIM);
  doc.text("THE BIG TABLE  ·  MAKE ROOM FOR MORE", PAGE_W / 2, 285, {
    align: "center", charSpace: 1.4,
  });
}

function difficultyDots(doc: jsPDF, x: number, y: number, level: number, accent: string): void {
  for (let i = 0; i < 3; i++) {
    const cx = x + i * 5;
    doc.setDrawColor(accent).setLineWidth(0.35);
    if (i < level) { doc.setFillColor(accent); doc.circle(cx, y, 1.1, "FD"); }
    else doc.circle(cx, y, 1.1, "S");
  }
}

/* ── Page 1: Menu Card ─────────────────────────────────────── */
function menuCardPage(doc: jsPDF, occ: OccasionData, serves: number, system: UnitSystem, serveMin: number): void {
  const accent = accentOf(occ);
  doc.setDrawColor(GOLD).setLineWidth(0.5).rect(14, 14, PAGE_W - 28, 269);
  doc.setDrawColor(GOLD).setLineWidth(0.2).rect(16.5, 16.5, PAGE_W - 33, 264);

  eyebrow(doc, `${occ.occasion}  ·  ${occ.tier === "around-the-table" ? "Around the Table" : "Fill the Room"}`, 64);

  doc.setFont("Cormorant", "normal").setFontSize(30).setTextColor(NAVY);
  const titleLines = doc.splitTextToSize(occ.recipeTitle, 140) as string[];
  let y = 84;
  for (const line of titleLines) { doc.text(line, PAGE_W / 2, y, { align: "center" }); y += 12.5; }

  goldRule(doc, y + 2);
  y += 12;
  eyebrow(doc, occ.cuisine.replace(/\s*·\s*/g, "  ·  "), y);
  y += 9;
  eyebrow(doc, `For ${serves} guests  ·  Served at ${fmtTime(serveMin, system)}`, y, NAVY);

  if (occ.difficulty) difficultyDots(doc, PAGE_W / 2 - 5, y + 8, occ.difficulty, accent);

  if (occ.pairings.length > 0) {
    let py = 200;
    eyebrow(doc, "To Drink", py, GOLD_DIM);
    py += 8;
    doc.setFont("Lato", "normal").setFontSize(10.5).setTextColor(NAVY);
    for (const t of occ.pairings) {
      const lines = doc.splitTextToSize(t, 130) as string[];
      for (const l of lines) { doc.text(l, PAGE_W / 2, py, { align: "center" }); py += 6; }
      py += 2;
    }
  }
  footerMark(doc);
}

/* ── Page 2: Day Plan ──────────────────────────────────────── */
function dayPlanPage(doc: jsPDF, occ: OccasionData, system: UnitSystem, serveMin: number, note: string): void {
  const accent = accentOf(occ);
  eyebrow(doc, occ.occasion, 26);
  doc.setFont("Cormorant", "normal").setFontSize(24).setTextColor(NAVY);
  doc.text("Plan Your Day", PAGE_W / 2, 38, { align: "center" });
  goldRule(doc, 44);
  eyebrow(doc, `Serve at ${fmtTime(serveMin, system)}`, 52, NAVY);

  const plan = planBackwards(occ.timeline, serveMin);
  let y = 68;
  doc.setDrawColor("#E6D9C4").setLineWidth(0.3);
  doc.line(MARGIN + 3, y - 4, MARGIN + 3, y + plan.length * 12 - 8);
  for (const st of plan) {
    doc.setDrawColor(accent).setLineWidth(0.4);
    if (st.isServe) { doc.setFillColor(accent); doc.circle(MARGIN + 3, y - 1.2, 1.5, "FD"); }
    else { doc.setFillColor("#FFFFFF"); doc.circle(MARGIN + 3, y - 1.2, 1.5, "FD"); }
    doc.setFont("Josefin", "normal").setFontSize(11).setTextColor(NAVY);
    doc.text(fmtTime(st.startMin, system), MARGIN + 10, y);
    doc.setFont("Lato", "normal").setFontSize(11).setTextColor("#3A2E28");
    doc.text(st.name, MARGIN + 38, y);
    if (st.dur > 0) {
      doc.setFont("Josefin", "normal").setFontSize(7.5).setTextColor(INK_SOFT);
      doc.text(durText(st.dur).toUpperCase(), PAGE_W - MARGIN, y, { align: "right", charSpace: 0.8 });
    }
    y += 12;
  }

  y += 8;
  eyebrow(doc, "Your Notes", y, GOLD_DIM);
  y += 6;
  doc.setDrawColor("#E6D9C4").setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, 62, 2, 2);
  if (note.trim()) {
    doc.setFont("Lato", "normal").setFontSize(10).setTextColor("#3A2E28");
    const lines = doc.splitTextToSize(note.trim(), PAGE_W - MARGIN * 2 - 12) as string[];
    let ny = y + 9;
    for (const l of lines.slice(0, 8)) { doc.text(l, MARGIN + 6, ny); ny += 6.5; }
  } else {
    doc.setDrawColor("#E6D9C4").setLineWidth(0.25);
    for (let i = 1; i <= 4; i++) doc.line(MARGIN + 6, y + i * 12, PAGE_W - MARGIN - 6, y + i * 12);
  }
  footerMark(doc);
}

/* ── Page 3: Shopping List ─────────────────────────────────── */
function shoppingPage(doc: jsPDF, occ: OccasionData, serves: number, system: UnitSystem): void {
  const accent = accentOf(occ);
  eyebrow(doc, occ.occasion, 26);
  doc.setFont("Cormorant", "normal").setFontSize(24).setTextColor(NAVY);
  doc.text("Shopping List", PAGE_W / 2, 38, { align: "center" });
  goldRule(doc, 44);
  eyebrow(doc, `For ${serves} guests`, 52, NAVY);

  const items = buildShoppingList(occ, serves, system);
  let y = 68;
  for (const it of items) {
    doc.setDrawColor(accent).setLineWidth(0.4);
    doc.roundedRect(MARGIN, y - 3.4, 4, 4, 0.8, 0.8);
    doc.setFont("Lato", "normal").setFontSize(11).setTextColor("#3A2E28");
    doc.text(it.name, MARGIN + 8, y);
    doc.setFont("Josefin", "normal").setFontSize(10.5).setTextColor(NAVY);
    doc.text(it.qty, PAGE_W - MARGIN, y, { align: "right" });
    doc.setDrawColor("#E6D9C4").setLineWidth(0.2);
    doc.line(MARGIN, y + 3.4, PAGE_W - MARGIN, y + 3.4);
    y += 11;
    if (y > 268) { footerMark(doc); doc.addPage(); y = 30; }
  }
  if (occ.ovenCelsius !== null) {
    y += 6;
    eyebrow(doc, `Oven: ${fmtOven(occ.ovenCelsius, system)}`, y, GOLD_DIM);
  }
  footerMark(doc);
}

/* ── Builders & exports ────────────────────────────────────── */
function serveMinutes(serveAt: string): number {
  const [h, m] = serveAt.split(":").map(Number);
  return (h || 19) * 60 + (m || 0);
}

export function buildKitchenPack(
  occ: OccasionData, serves: number, system: UnitSystem, serveAt: string, note: string
): jsPDF {
  const doc = newDoc();
  const sm = serveMinutes(serveAt);
  menuCardPage(doc, occ, serves, system, sm);
  doc.addPage();
  dayPlanPage(doc, occ, system, sm, note);
  doc.addPage();
  shoppingPage(doc, occ, serves, system);
  return doc;
}

export function buildShoppingOnly(
  occ: OccasionData, serves: number, system: UnitSystem
): jsPDF {
  const doc = newDoc();
  shoppingPage(doc, occ, serves, system);
  return doc;
}

export function exportKitchenPack(
  occ: OccasionData, serves: number, system: UnitSystem, serveAt: string, note: string
): void {
  buildKitchenPack(occ, serves, system, serveAt, note).save(`big-table-${occ.id}-kitchen-pack.pdf`);
}

export function exportShoppingList(
  occ: OccasionData, serves: number, system: UnitSystem
): void {
  buildShoppingOnly(occ, serves, system).save(`big-table-${occ.id}-shopping-list.pdf`);
}
