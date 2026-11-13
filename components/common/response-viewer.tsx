"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Copy, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type View = "table" | "tree" | "raw";

const VIEW_LABELS: Record<View, string> = {
  table: "Table",
  tree: "Tree",
  raw: "Raw",
};

// Render at most this many children/rows before asking to show the rest
const PAGE_SIZE = 100;

// Copy buttons are always visible on touch devices, hover-revealed elsewhere
const HOVER_REVEAL =
  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus:opacity-100";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRecordArray(value: unknown): value is JsonRecord[] {
  return Array.isArray(value) && value.length > 0 && value.every(isRecord);
}

function toCopyText(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function summarize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} ${value.length === 1 ? "item" : "items"}]`;
  if (isRecord(value)) {
    const count = Object.keys(value).length;
    return `{${count} ${count === 1 ? "key" : "keys"}}`;
  }
  return "";
}

function hasOwn(record: JsonRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

interface ParsedBody {
  parsed: unknown;
  isJson: boolean;
  /** The exact response text, when we have it */
  original: string | null;
}

function parseInput(value: unknown, text: string | null | undefined): ParsedBody {
  if (typeof text === "string") {
    try {
      return { parsed: JSON.parse(text), isJson: true, original: text };
    } catch {
      return { parsed: text, isJson: false, original: text };
    }
  }
  // Already decoded upstream; a string here is a non-JSON body, never JSON to parse again
  if (typeof value === "string") return { parsed: value, isJson: false, original: value };
  return { parsed: value, isJson: true, original: null };
}

function getRawText({ parsed, isJson, original }: ParsedBody): string {
  if (original !== null) return original;
  return isJson ? JSON.stringify(parsed, null, 2) : String(parsed ?? "");
}

// Other top-level values this small (e.g. `meta`, `pagination`) don't stop the table being the default view
const SMALL_SIBLING_ENTRIES = 10;

function isSmall(value: unknown): boolean {
  if (value === null || typeof value !== "object") return true;
  return Object.keys(value).length <= SMALL_SIBLING_ENTRIES;
}

interface PrimaryTable {
  key: string | null;
  rows: JsonRecord[];
  /** Whether the table is the main payload and should be the default view */
  preferred: boolean;
}

// The array of objects worth showing as a table: the body itself, or the largest
// top-level key holding one (e.g. `{ data: [...], meta: {...} }`).
function findPrimaryTable(value: unknown): PrimaryTable | null {
  if (isRecordArray(value)) return { key: null, rows: value, preferred: true };
  if (!isRecord(value)) return null;

  let best: { key: string; rows: JsonRecord[] } | null = null;
  for (const [key, child] of Object.entries(value)) {
    if (isRecordArray(child) && (!best || child.length > best.rows.length)) {
      best = { key, rows: child };
    }
  }
  if (!best) return null;

  const bestKey = best.key;
  const preferred = Object.entries(value).every(([key, child]) => key === bestKey || isSmall(child));
  return { ...best, preferred };
}

function CopyButton({ getText, className, label = "Copy" }: { getText: () => string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(event: React.MouseEvent) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={label}
      aria-label={label}
      className={cn("shrink-0 rounded p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200", className)}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function Primitive({ value, quoted = true }: { value: unknown; quoted?: boolean }) {
  if (value === null) return <span className="text-slate-500">null</span>;
  if (typeof value === "string") {
    return (
      <span className="whitespace-pre-wrap break-words text-emerald-300">
        {quoted ? `"${value}"` : value}
      </span>
    );
  }
  if (typeof value === "number") return <span className="text-sky-300">{value}</span>;
  if (typeof value === "boolean") return <span className="text-amber-300">{String(value)}</span>;
  return <span className="text-slate-300">{String(value)}</span>;
}

function ShowMoreButton({ hidden, onClick }: { hidden: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 rounded px-2 py-0.5 text-xs text-brand-300 hover:bg-slate-800 hover:text-brand-200"
    >
      Show {hidden} more
    </button>
  );
}

interface TreeNodeProps {
  name?: string | number;
  value: unknown;
  depth: number;
  defaultDepth: number;
}

function TreeNode({ name, value, depth, defaultDepth }: TreeNodeProps) {
  const isContainer = value !== null && typeof value === "object";
  const [open, setOpen] = useState(depth < defaultDepth);
  const [asTable, setAsTable] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const entries = useMemo(
    () => (isContainer ? Object.entries(value as JsonRecord) : []),
    [isContainer, value]
  );
  const recordArray = useMemo(() => isRecordArray(value), [value]);
  const visible = showAll ? entries : entries.slice(0, PAGE_SIZE);

  const label = (
    <>
      {name !== undefined && (
        <span className={cn("mr-1.5", typeof name === "number" ? "text-slate-500" : "text-violet-300")}>
          {name}:
        </span>
      )}
      {isContainer ? <span className="text-slate-500">{summarize(value)}</span> : <Primitive value={value} />}
    </>
  );

  return (
    <div>
      <div className="group flex items-start gap-1 rounded px-1 py-0.5 hover:bg-slate-800/40">
        {isContainer ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="flex min-w-0 flex-1 items-start gap-1 rounded text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400"
          >
            <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-90")} />
            <span className="min-w-0 flex-1">{label}</span>
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-1">
            <span className="w-4 shrink-0" />
            <span className="min-w-0 flex-1">{label}</span>
          </div>
        )}
        {recordArray && open && (
          <button
            type="button"
            onClick={() => setAsTable((prev) => !prev)}
            className="shrink-0 rounded border border-slate-700 px-1.5 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
          >
            {asTable ? "Tree" : "Table"}
          </button>
        )}
        <CopyButton getText={() => toCopyText(value)} className={cn("-my-0.5", HOVER_REVEAL)} />
      </div>

      {isContainer && open && (
        asTable && recordArray ? (
          <div className="my-1 ml-5">
            <JsonTable rows={value as JsonRecord[]} />
          </div>
        ) : (
          <div className="ml-[11px] border-l border-slate-800 pl-2">
            {visible.map(([key, child]) => (
              <TreeNode
                key={key}
                name={Array.isArray(value) ? Number(key) : key}
                value={child}
                depth={depth + 1}
                defaultDepth={defaultDepth}
              />
            ))}
            {!showAll && entries.length > PAGE_SIZE && (
              <ShowMoreButton hidden={entries.length - PAGE_SIZE} onClick={() => setShowAll(true)} />
            )}
          </div>
        )
      )}
    </div>
  );
}

function TableCell({ value }: { value: unknown }) {
  const [open, setOpen] = useState(false);

  if (value === undefined) return <span className="text-slate-700">—</span>;
  if (value === null || typeof value !== "object") return <Primitive value={value} quoted={false} />;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="whitespace-nowrap rounded px-1 text-slate-400 underline decoration-slate-700 underline-offset-2 hover:bg-slate-800 hover:text-slate-200"
      >
        {summarize(value)}
      </button>
    );
  }

  return (
    <div className="min-w-[12rem]">
      <button type="button" onClick={() => setOpen(false)} className="mb-1 text-[11px] text-slate-500 hover:text-slate-300">
        Collapse
      </button>
      <TreeNode value={value} depth={0} defaultDepth={1} />
    </div>
  );
}

function JsonTable({ rows, stickyHeader = false }: { rows: JsonRecord[]; stickyHeader?: boolean }) {
  const [showAll, setShowAll] = useState(false);

  // Union of keys across all rows, in order of first appearance
  const columns = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((row) => Object.keys(row).forEach((key) => seen.add(key)));
    return Array.from(seen);
  }, [rows]);

  const visible = showAll ? rows : rows.slice(0, PAGE_SIZE);
  const thClass = cn(
    "whitespace-nowrap border-b border-slate-800 bg-slate-900 px-3 py-2 font-sans text-xs font-semibold text-slate-300",
    stickyHeader && "sticky top-0 z-10"
  );

  return (
    <div className={cn(!stickyHeader && "overflow-x-auto rounded-lg border border-slate-800")}>
      <table className="w-max min-w-full border-separate border-spacing-0 text-left font-mono text-sm">
        <thead>
          <tr>
            <th className={cn(thClass, "w-px text-slate-500")}>#</th>
            {columns.map((column) => (
              <th key={column} className={thClass}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, index) => (
            <tr key={index} className="align-top even:bg-slate-900/40 hover:bg-slate-800/40">
              <td className="border-b border-slate-800/60 px-3 py-1.5 text-xs text-slate-500">{index}</td>
              {columns.map((column) => (
                <td key={column} className="border-b border-slate-800/60 px-3 py-1.5">
                  <div className="max-w-xs">
                    <TableCell value={hasOwn(row, column) ? row[column] : undefined} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && rows.length > PAGE_SIZE && (
        <div className="px-2 py-1">
          <ShowMoreButton hidden={rows.length - PAGE_SIZE} onClick={() => setShowAll(true)} />
        </div>
      )}
    </div>
  );
}

interface ResponseViewerProps {
  /** An already-decoded response (objects/arrays are JSON, a string is plain text) */
  value?: unknown;
  /** The exact response text, parsed here if it is JSON */
  text?: string | null;
  className?: string;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ResponseViewer({ value, text, className }: ResponseViewerProps) {
  const body = useMemo(() => parseInput(value, text), [value, text]);
  const primaryTable = useMemo(() => (body.isJson ? findPrimaryTable(body.parsed) : null), [body]);

  const views: View[] = [
    ...(primaryTable ? (["table"] as const) : []),
    ...(body.isJson ? (["tree"] as const) : []),
    "raw",
  ];
  const defaultView: View = primaryTable && !primaryTable.preferred && body.isJson ? "tree" : views[0];

  // The user's explicit pick, kept across responses while it still applies
  const [chosenView, setChosenView] = useState<View | null>(null);
  const view = chosenView && views.includes(chosenView) ? chosenView : defaultView;

  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setExpanded(false);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    containerRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [expanded]);

  // Keep Tab inside the full-screen view so it can't reach controls hidden behind it
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!expanded || event.key !== "Tab" || !containerRef.current) return;
    const focusable = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === containerRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      {expanded && <div className="fixed inset-0 z-40 bg-slate-950/80" onClick={() => setExpanded(false)} />}
      <div
        ref={containerRef}
        tabIndex={-1}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded || undefined}
        aria-label={expanded ? "Response" : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-950 focus:outline-none",
          expanded && "fixed inset-2 z-50 shadow-2xl sm:inset-6",
          className
        )}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-2 py-1.5">
          {views.length > 1 && (
            <div className="flex rounded-md border border-slate-800 bg-slate-950 p-0.5">
              {views.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setChosenView(option)}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition",
                    view === option ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {VIEW_LABELS[option]}
                </button>
              ))}
            </div>
          )}
          {view === "table" && primaryTable && (
            <span className="truncate text-xs text-slate-500">
              {primaryTable.key && <code className="text-violet-300">{primaryTable.key}</code>}
              {primaryTable.key && " · "}
              {primaryTable.rows.length} rows
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <CopyButton getText={() => getRawText(body)} label="Copy response" />
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              title={expanded ? "Exit full screen (Esc)" : "Full screen"}
              aria-label={expanded ? "Exit full screen" : "Full screen"}
              className="rounded p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
            >
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className={cn("min-h-0 overflow-auto", expanded ? "flex-1" : "max-h-[70vh]")}>
          {view === "table" && primaryTable && <JsonTable rows={primaryTable.rows} stickyHeader />}
          {view === "tree" && (
            <div className="p-2 font-mono text-sm">
              <TreeNode value={body.parsed} depth={0} defaultDepth={2} />
            </div>
          )}
          {view === "raw" && <RawView body={body} />}
        </div>
      </div>
    </>
  );
}

function RawView({ body }: { body: ParsedBody }) {
  const rawText = useMemo(() => getRawText(body), [body]);
  // Exact text from the server may be minified onto one line, so let it wrap
  const pretty = body.isJson && body.original === null;

  return (
    <pre className={cn("p-3 font-mono text-sm text-slate-300", pretty ? "whitespace-pre" : "whitespace-pre-wrap break-all")}>
      {rawText}
    </pre>
  );
}
