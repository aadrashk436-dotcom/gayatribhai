import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const customer = {
      id: `cust_${Date.now()}`,
      name: name || email.split("@")[0],
      email: email.toLowerCase().trim(),
      phone: phone || "+91 98765 43210",
      tier: "Silver",
      points: 250,
    };

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      success: true,
      token,
      customer,
      message: "Account created successfully. Welcome to Gayatri Bhai!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
  }
}
