"use client";
import { X, Loader2, CheckCircle2, Clock } from "lucide-react";
import { ImageItem } from "../types";

interface Props {
  img: ImageItem;
  onRemove: (id: string) => void;
}

export default function ImageCard({ img, onRemove }: Props) {
  return (
    <div style={{
      position: "relative",
      borderRadius: "10px",
      overflow: "hidden",
      border: `1px solid ${img.status === "done" ? "var(--success)" : img.status === "error" ? "var(--danger)" : "var(--border)"}`,
      background: "var(--bg-card)",
      transition: "border-color 0.2s",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.dataUrl} alt="preview" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />

      <button
        onClick={() => onRemove(img.id)}
        style={{
          position: "absolute", top: "6px", right: "6px",
          background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%",
          width: "22px", height: "22px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        }}
      >
        <X size={12} />
      </button>

      <div style={{
        position: "absolute", bottom: "0", left: "0", right: "0",
        padding: "4px 8px",
        background: img.status === "done" ? "rgba(16,185,129,0.85)"
          : img.status === "loading" ? "rgba(59,130,246,0.85)"
          : img.status === "error" ? "rgba(239,68,68,0.85)"
          : "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", gap: "4px", justifyContent: "center",
      }}>
        {img.status === "loading" && <Loader2 size={10} className="animate-spin" />}
        {img.status === "done" && <CheckCircle2 size={10} />}
        {img.status === "waiting" && <Clock size={10} />}
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#fff" }}>
          {img.status === "done" ? "Đã đọc" : img.status === "loading" ? "Đang xử lý..." : img.status === "error" ? "Lỗi" : "Chờ"}
        </span>
      </div>
    </div>
  );
}
