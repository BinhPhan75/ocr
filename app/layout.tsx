import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimerMark OCR — Trích xuất thông tin dự án",
  description: "Upload ảnh TimerMark, tự động đọc và gán thông tin vào dự án",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
