export type ImageStatus = "waiting" | "loading" | "done" | "error";

export interface OcrData {
  rawText: string;
  projectName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  worker: string;
  location: string;
  taskDescription: string;
  notes: string;
}

export interface ImageItem {
  id: string;
  file: File;
  dataUrl: string;
  status: ImageStatus;
  result?: OcrData;
  assignedProject?: string;
  saved?: boolean;
}

export const SAMPLE_PROJECTS = [
  "Dự án A — Nội thất Vinhomes",
  "Dự án B — Xây dựng Quận 9",
  "Dự án C — Cải tạo Quận 1",
  "Dự án D — Thiết kế văn phòng",
];
