import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType } = await req.json();
    if (!base64 || !mediaType) {
      return NextResponse.json({ error: "Thiếu dữ liệu ảnh" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
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

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi xử lý OCR" }, { status: 500 });
  }
}
