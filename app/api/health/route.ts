import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const keyPrefix = hasKey ? process.env.ANTHROPIC_API_KEY!.substring(0, 12) + "..." : "MISSING";
  return NextResponse.json({
    status: hasKey ? "ok" : "error",
    ANTHROPIC_API_KEY: keyPrefix,
    message: hasKey ? "API key đã được cấu hình" : "Chưa có ANTHROPIC_API_KEY trong Environment Variables",
  });
}
