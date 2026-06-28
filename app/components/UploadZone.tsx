"use client";
import { useRef, useState } from "react";
import { Upload, ImagePlus } from "lucide-react";

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = (files: FileList | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imgs.length) onFiles(imgs);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
        borderRadius: "16px",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: dragging ? "rgba(59,130,246,0.06)" : "var(--bg-card)",
        transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e => handle(e.target.files)} />
      <div style={{ marginBottom: "12px" }}>
        {dragging
          ? <Upload size={36} color="var(--accent)" />
          : <ImagePlus size={36} color="var(--text-muted)" />}
      </div>
      <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>
        {dragging ? "Thả ảnh vào đây" : "Kéo thả hoặc chọn ảnh TimerMark"}
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
        Hỗ trợ JPG, PNG, HEIC — nhiều ảnh cùng lúc
      </p>
    </div>
  );
}
