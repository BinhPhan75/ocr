"use client";
import { useState, useCallback } from "react";
import { Scan, Trash2, Wand2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import UploadZone from "./components/UploadZone";
import ImageCard from "./components/ImageCard";
import ResultCard from "./components/ResultCard";
import { ImageItem, OcrData } from "./types";

// Resize & convert any image to JPEG < 1MB before sending to API
function resizeToJpeg(dataUrl: string, maxPx = 1600, quality = 0.85): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        const ratio = Math.min(maxPx / width, maxPx / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas không khả dụng"));
      ctx.drawImage(img, 0, 0, width, height);
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      resolve({ base64: jpeg.split(",")[1], mediaType: "image/jpeg" });
    };
    img.onerror = () => reject(new Error("Không đọc được ảnh"));
    img.src = dataUrl;
  });
}

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorDetail, setErrorDetail] = useState("");

  const addFiles = useCallback((files: File[]) => {
    const newItems: ImageItem[] = [];
    let loaded = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        newItems.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          dataUrl: ev.target?.result as string,
          status: "waiting",
        });
        loaded++;
        if (loaded === files.length) {
          setImages(prev => [...prev, ...newItems]);
          setErrorDetail("");
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
  };

  const clearAll = () => { setImages([]); setStatusMsg(""); setErrorDetail(""); };

  const runOcr = async () => {
    const waiting = images.filter(i => i.status === "waiting" || i.status === "error");
    if (!waiting.length) return;
    setRunning(true);
    setErrorDetail("");

    for (let i = 0; i < waiting.length; i++) {
      const img = waiting[i];
      setStatusMsg(`Đang xử lý ${i + 1}/${waiting.length}...`);
      setImages(prev => prev.map(x => x.id === img.id ? { ...x, status: "loading" } : x));

      try {
        // Resize & convert to JPEG (handles HEIC, large files, unsupported formats)
        const { base64, mediaType } = await resizeToJpeg(img.dataUrl);

        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, mediaType }),
        });

        const json = await res.json();

        if (json.success) {
          setImages(prev => prev.map(x => x.id === img.id ? { ...x, status: "done", result: json.data } : x));
        } else {
          const msg = json.error || "Lỗi không xác định";
          setErrorDetail(msg);
          setImages(prev => prev.map(x => x.id === img.id ? { ...x, status: "error" } : x));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErrorDetail(msg);
        setImages(prev => prev.map(x => x.id === img.id ? { ...x, status: "error" } : x));
      }
    }

    setRunning(false);
    setStatusMsg("");
  };

  const updateResult = (id: string, data: Partial<OcrData>) => {
    setImages(prev => prev.map(x => x.id === id ? { ...x, result: { ...x.result!, ...data } } : x));
  };

  const assignProject = (id: string, project: string) => {
    setImages(prev => prev.map(x => x.id === id ? { ...x, assignedProject: project, saved: false } : x));
  };

  const saveAssignment = (id: string) => {
    setImages(prev => prev.map(x => x.id === id ? { ...x, saved: true } : x));
  };

  const doneItems = images.filter(i => i.status === "done");
  const savedCount = images.filter(i => i.saved).length;
  const hasWaiting = images.some(i => i.status === "waiting" || i.status === "error");
  const hasError = images.some(i => i.status === "error");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top bar */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(15,17,23,0.92)",
        backdropFilter: "blur(12px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "var(--accent)", borderRadius: "8px", padding: "6px", display: "flex" }}>
            <Scan size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>TimerMark OCR</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Trích xuất thông tin chấm công từ ảnh</div>
          </div>
        </div>
        {savedCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--success-dim)", color: "var(--success-text)", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
            <CheckCircle2 size={13} /> {savedCount} ảnh đã gán xong
          </div>
        )}
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Upload */}
        <UploadZone onFiles={addFiles} disabled={running} />

        {/* Preview grid */}
        {images.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "10px",
              marginBottom: "16px",
            }}>
              {images.map(img => (
                <ImageCard key={img.id} img={img} onRemove={removeImage} />
              ))}
            </div>

            {/* Action bar */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={runOcr}
                disabled={running || !hasWaiting}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", borderRadius: "10px",
                  fontWeight: 600, fontSize: "14px", border: "none",
                  cursor: running || !hasWaiting ? "not-allowed" : "pointer",
                  background: running || !hasWaiting ? "var(--border)" : "var(--accent)",
                  color: running || !hasWaiting ? "var(--text-muted)" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                {running ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                {running ? "Đang xử lý..." : "Chạy OCR"}
              </button>

              <button
                onClick={clearAll}
                disabled={running}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "10px 16px", borderRadius: "10px",
                  fontWeight: 500, fontSize: "14px",
                  border: "1px solid var(--border)", cursor: "pointer",
                  background: "transparent", color: "var(--text-secondary)",
                }}
              >
                <Trash2 size={15} /> Xóa tất cả
              </button>

              {statusMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)" }}>
                  <Loader2 size={13} className="animate-spin" /> {statusMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error notice with detail */}
        {hasError && (
          <div style={{
            marginTop: "16px", padding: "12px 16px", borderRadius: "10px",
            background: "var(--danger-dim)", border: "1px solid var(--danger)",
            fontSize: "13px", color: "#fca5a5",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: errorDetail ? "6px" : 0 }}>
              <AlertCircle size={15} />
              Một số ảnh bị lỗi. Nhấn &quot;Chạy OCR&quot; để thử lại.
            </div>
            {errorDetail && (
              <div style={{ fontSize: "12px", color: "#fca5a5", opacity: 0.8, paddingLeft: "23px", fontFamily: "monospace" }}>
                Chi tiết: {errorDetail}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {doneItems.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "17px", color: "var(--text-primary)" }}>
                Kết quả trích xuất
              </h2>
              <span style={{
                background: "var(--accent-dim)", color: "var(--accent-text)",
                padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
              }}>
                {doneItems.length} ảnh
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {doneItems.map((item, idx) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onUpdate={updateResult}
                  onAssign={assignProject}
                  onSave={saveAssignment}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {images.length === 0 && (
          <div style={{ marginTop: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            <Scan size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: "14px" }}>Upload ảnh TimerMark để bắt đầu trích xuất thông tin</p>
          </div>
        )}
      </main>
    </div>
  );
}
