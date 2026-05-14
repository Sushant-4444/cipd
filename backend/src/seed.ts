/**
 * Imports events from a CSV file into the Payload Events collection.
 *
 * Usage:
 *   npm run seed                                    # uses default CSV path
 *   npm run seed -- ./path/to/events.csv            # custom path
 *
 * Behaviour:
 *   - WIPES the existing Events collection before inserting (so re-running
 *     the seed gives a deterministic state).
 *   - Reads the CSV with the column structure of events-template.xlsx.
 *   - Parses multi-line cells (Agenda, Speakers, Highlights) and
 *     pipe-separated cells (Topics, Image Filenames).
 *   - Tries to derive an ISO date from human strings like "13th September 2025".
 *   - Stores any Notes-for-Web-Team URL in both `internalNotes` and `recapUrl`
 *     so the "View Highlights" link can use it.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { getPayload } from "payload";
import config from "./payload.config.js";

// ── CSV parsing ──────────────────────────────────────────────────────────
// Lightweight CSV parser that handles quoted fields with embedded
// commas and newlines (matches the RFC 4180-ish dialect Excel produces).
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i += 1; continue;
      }
      field += ch; i += 1; continue;
    }
    if (ch === '"') { inQuotes = true; i += 1; continue; }
    if (ch === ",") { cur.push(field); field = ""; i += 1; continue; }
    if (ch === "\r") { i += 1; continue; }
    if (ch === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; i += 1; continue; }
    field += ch; i += 1;
  }
  if (field !== "" || cur.length) { cur.push(field); rows.push(cur); }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1)
    .filter((r) => r.some((c) => c && c.trim() !== ""))
    .map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
      return obj;
    });
}

// ── Field parsers ────────────────────────────────────────────────────────
const splitLines = (s: string) =>
  (s || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const splitPipes = (s: string) =>
  (s || "").split("|").map((p) => p.trim()).filter(Boolean);

function parseTopics(raw: string) {
  return splitPipes(raw).map((value) => ({ value }));
}

function parseHighlights(raw: string) {
  return splitLines(raw).map((value) => ({
    value: value.replace(/^[•\-•–—]\s*/, ""),
  }));
}

function parseAgenda(raw: string) {
  return splitLines(raw).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    return {
      time:    parts[0] ?? "",
      title:   parts[1] ?? "",
      speaker: parts[2] ?? "",
    };
  }).filter((a) => a.title);
}

function parseSpeakers(raw: string) {
  return splitLines(raw).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    return {
      name: parts[0] ?? "",
      role: parts[1] ?? "",
    };
  }).filter((s) => s.name);
}

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
  apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
  aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9,
  nov: 10, november: 10, dec: 11, december: 11,
};

function parseIsoDate(human: string): string | null {
  if (!human) return null;
  // "13th September 2025" / "1 May 2026" / "January 22, 2026"
  const m = human.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)[,\s]+(\d{4})/i)
        ?? human.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})/i);
  if (!m) return null;
  let day: number, month: number, year: number;
  if (/^\d/.test(m[1])) {
    day = parseInt(m[1], 10);
    month = MONTHS[m[2].toLowerCase()];
    year = parseInt(m[3], 10);
  } else {
    month = MONTHS[m[1].toLowerCase()];
    day = parseInt(m[2], 10);
    year = parseInt(m[3], 10);
  }
  if (month === undefined || isNaN(day) || isNaN(year)) return null;
  // Use noon UTC so timezone-sensitive parsers don't shift the date
  return new Date(Date.UTC(year, month, day, 12, 0, 0)).toISOString();
}

function parseInt0(v: string): number | null {
  if (!v) return null;
  const n = parseInt(v.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(process.cwd(), "cipd event xlsx - Sheet1.csv");

  console.log(`📄 Reading CSV: ${csvPath}`);
  const text = readFileSync(csvPath, "utf-8");
  const rows = parseCsv(text);
  console.log(`   Found ${rows.length} data rows`);

  console.log("🔌 Initializing Payload…");
  const payload = await getPayload({ config });

  // Wipe existing events
  const existing = await payload.find({ collection: "events", limit: 1000, depth: 0 });
  console.log(`🧹 Wiping ${existing.docs.length} existing events…`);
  for (const doc of existing.docs) {
    await payload.delete({ collection: "events", id: doc.id });
  }

  // Insert new events
  let displayOrder = 1;
  for (const row of rows) {
    const title = row["Title"];
    if (!title) continue;

    const tag = row["Status"] || "Past";
    const featured = (row["Featured"] || "No").toLowerCase().startsWith("y");
    const date = row["Date"] || "";
    const notes = row["Notes for Web Team"] || "";
    // A Google Photos / Drive URL in the notes is the public "highlights" link
    const externalUrl = notes.match(/https?:\/\/\S+/)?.[0];

    const data: Record<string, unknown> = {
      title,
      type:           row["Type"]       || "Event",
      tag,
      featured:       featured && tag !== "Past",
      date:           date || "TBA",
      isoDate:        parseIsoDate(date),
      time:           row["Time"]       || "TBA",
      location:       row["Location"]   || "TBA",
      format:         row["Format"]     || "",
      summary:        row["Summary"]    || `${row["Type"] || "Event"} hosted by CiPD, IIITD.`,
      fullDescription:row["Full Description"] || "",
      topics:         parseTopics(row["Topics (| separated)"]),
      capacity:       parseInt0(row["Capacity"]),
      registered:     parseInt0(row["Registered"]),
      prerequisites:  row["Prerequisites"] || "",
      agenda:         parseAgenda(row["Agenda (one per line)"]),
      speakers:       parseSpeakers(row["Speakers (one per line)"]),
      pastAction:     row["Past Action"]   || (tag === "Past" ? "View Highlights" : null),
      highlights:     parseHighlights(row["Highlights (one per line)"]),
      recapUrl:       externalUrl || "",
      internalNotes:  notes,
      displayOrder:   displayOrder++,
    };

    // Remove null fields so Payload uses field defaults where appropriate
    Object.keys(data).forEach((k) => {
      if (data[k] === null || data[k] === undefined) delete data[k];
    });

    const created = await payload.create({
      collection: "events",
      data: data as any,
    });
    console.log(`  ✓ [${created.id}] ${tag.padEnd(10)} ${row["Type"].padEnd(14)} ${title}`);
  }

  console.log(`\n✅ Imported ${rows.length} events.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
