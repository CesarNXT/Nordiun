"use client";
import { useEffect, useMemo, useState } from "react";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromISO(value?: string) {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? null : dt;
}

export function DateModal({
  value,
  onSave,
  onClose,
  maxDate,
}: {
  value?: string;
  onSave: (iso: string) => void;
  onClose: () => void;
  maxDate?: Date;
}) {
  const initial = fromISO(value) || new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [selected, setSelected] = useState<Date | null>(initial);
  const maxSelectable = maxDate || null;

  const daysMatrix = useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: Array<Array<Date | null>> = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const list: number[] = [];
    for (let y = now; y >= 1900; y--) list.push(y);
    return list;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <select
              className="border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 shadow-sm"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            >
              {meses.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-900 shadow-sm"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            className="rounded-full w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-900 hover:bg-slate-300"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-slate-600">
          {dias.map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysMatrix.flatMap((row, rIdx) =>
            row.map((cell, cIdx) => {
              if (!cell)
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="h-10 rounded-md"
                  />
                );
              const isSelected = selected && toISO(cell) === toISO(selected);
              const disabled = !!maxSelectable && cell > maxSelectable;
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  className={`h-10 rounded-md border text-slate-900 transition ${
                    isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-300 hover:bg-blue-50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={disabled}
                  onClick={() => {
                    const iso = toISO(cell);
                    setSelected(cell);
                    onSave(iso);
                    onClose();
                  }}
                >
                  {cell.getDate()}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              if (selected && (!maxSelectable || selected <= maxSelectable)) onSave(toISO(selected));
              onClose();
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
