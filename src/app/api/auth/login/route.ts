import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Simulated / resilient customer payload
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const customer = {
      id: `cust_${Buffer.from(email).toString("base64").slice(0, 10)}`,
      name,
      email: email.toLowerCase().trim(),
      phone: "+91 98765 43210",
      tier: "Silver",
      points: 1240,
    };

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      success: true,
      token,
      customer,
      message: "Login successful",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
