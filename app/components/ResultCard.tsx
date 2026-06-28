"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, FolderOpen, Save, CheckCircle2, Calendar, Clock, User, MapPin, FileText, AlignLeft } from "lucide-react";
import { ImageItem, OcrData, SAMPLE_PROJECTS } from "../types";

interface Props {
  item: ImageItem;
  index: number;
  onUpdate: (id: string, data: Partial<OcrData>) => void;
  onAssign: (id: string, project: string) => void;
  onSave: (id: string) => void;
}

function Field({ label, icon, value, onChange, multiline }: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {icon}{label}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

export default function ResultCard({ item, index, onUpdate, onAssign, onSave }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const r = item.result!;

  const upd = (field: keyof OcrData) => (v: string) => onUpdate(item.id, { [field]: v });

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${item.saved ? "var(--success)" : "var(--border)"}`,
      borderRadius: "14px",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "12px", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.dataUrl} alt="" style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "2px" }}>
            Ảnh {index + 1}{r.projectName ? ` — ${r.projectName}` : ""}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {[r.date, r.startTime && r.endTime ? `${r.startTime} → ${r.endTime}` : r.startTime, r.duration].filter(Boolean).join("  ·  ")}
          </div>
          {item.saved && (
            <div style={{ marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--success-dim)", color: "var(--success-text)", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>
              <CheckCircle2 size={10} /> Đã gán: {item.assignedProject}
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Field label="Tên dự án" icon={<FolderOpen size={10} />} value={r.projectName} onChange={upd("projectName")} />
        <Field label="Ngày" icon={<Calendar size={10} />} value={r.date} onChange={upd("date")} />
        <Field label="Giờ bắt đầu" icon={<Clock size={10} />} value={r.startTime} onChange={upd("startTime")} />
        <Field label="Giờ kết thúc" icon={<Clock size={10} />} value={r.endTime} onChange={upd("endTime")} />
        <Field label="Thời lượng" icon={<Clock size={10} />} value={r.duration} onChange={upd("duration")} />
        <Field label="Người thực hiện" icon={<User size={10} />} value={r.worker} onChange={upd("worker")} />
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Địa điểm" icon={<MapPin size={10} />} value={r.location} onChange={upd("location")} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Công việc / Hạng mục" icon={<FileText size={10} />} value={r.taskDescription} onChange={upd("taskDescription")} multiline />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Ghi chú" icon={<AlignLeft size={10} />} value={r.notes} onChange={upd("notes")} multiline />
        </div>
      </div>

      {/* Assign & Save */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.15)", display: "flex", gap: "8px", alignItems: "center" }}>
        <select value={item.assignedProject || ""} onChange={e => onAssign(item.id, e.target.value)} style={{ flex: 1 }}>
          <option value="">— Gán vào dự án —</option>
          {SAMPLE_PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
          <option value="__new__">+ Tạo dự án mới</option>
        </select>
        <button
          onClick={() => onSave(item.id)}
          disabled={!item.assignedProject || item.assignedProject === "__new__"}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "13px",
            border: "none", cursor: "pointer",
            background: item.saved ? "var(--success)" : "var(--accent)",
            color: "#fff", opacity: (!item.assignedProject || item.assignedProject === "__new__") ? 0.4 : 1,
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
        >
          {item.saved ? <><CheckCircle2 size={14} /> Đã gán</> : <><Save size={14} /> Gán dự án</>}
        </button>
      </div>

      {/* Raw text toggle */}
      <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)" }}>
        <button onClick={() => setShowRaw(v => !v)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", fontSize: "12px",
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          {showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Text gốc đọc được
        </button>
        {showRaw && (
          <pre style={{
            marginTop: "8px", fontSize: "11px", color: "var(--text-secondary)",
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "10px", whiteSpace: "pre-wrap",
            wordBreak: "break-word", maxHeight: "120px", overflowY: "auto",
            fontFamily: "monospace",
          }}>
            {r.rawText || "(Không đọc được text)"}
          </pre>
        )}
      </div>
    </div>
  );
}
