import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been received by the Gayatri Bhai concierge.",
      inquiryId: "INQ-" + Date.now().toString().slice(-6),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit contact message" }, { status: 500 });
  }
}
