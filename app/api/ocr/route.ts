import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  // Check API key first
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY chưa được cấu hình trong Environment Variables" },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const body = await req.json();
    const { base64, mediaType } = body;

    if (!base64 || !mediaType) {
      return NextResponse.json({ error: "Thiếu dữ liệu ảnh" }, { status: 400 });
    }

    // Validate mediaType
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const safeMediaType = allowedTypes.includes(mediaType) ? mediaType : "image/jpeg";

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: safeMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text: `Đây là ảnh chụp từ ứng dụng TimerMark (ứng dụng chấm công/ghi nhận giờ làm việc tại công trình/dự án).
Hãy đọc toàn bộ chữ trong ảnh và trích xuất thông tin. Chỉ trả về JSON thuần, KHÔNG có markdown, KHÔNG có giải thích:
{
  "rawText": "(toàn bộ text đọc được trong ảnh, giữ nguyên định dạng)",
  "projectName": "(tên dự án hoặc công trình nếu có, để chuỗi rỗng nếu không rõ)",
  "date": "(ngày DD/MM/YYYY nếu có, để chuỗi rỗng nếu không rõ)",
  "startTime": "(giờ bắt đầu HH:MM nếu có)",
  "endTime": "(giờ kết thúc HH:MM nếu có)",
  "duration": "(thời lượng làm việc, vd: 8h30m nếu có)",
  "worker": "(tên người thực hiện nếu có)",
  "location": "(địa điểm nếu có)",
  "taskDescription": "(mô tả công việc, hạng mục thi công nếu có)",
  "notes": "(ghi chú khác nếu có)"
}`,
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";

    // Try to parse JSON — handle cases where model wraps in markdown
    let parsed;
    try {
      const clean = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(clean);
    } catch {
      // If JSON parse fails, return rawText so user still sees something
      parsed = {
        rawText,
        projectName: "", date: "", startTime: "", endTime: "",
        duration: "", worker: "", location: "", taskDescription: "", notes: "",
      };
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    console.error("OCR error:", message);
    return NextResponse.json(
      { error: `Lỗi xử lý OCR: ${message}` },
      { status: 500 }
    );
  }
}
