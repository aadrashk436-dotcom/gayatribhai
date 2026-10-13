import { NextResponse } from "next/server";

const VALID_COUPONS: Record<
  string,
  { type: "percentage" | "fixed"; value: number; minOrder: number; desc: string }
> = {
  WELCOME10: {
    type: "percentage",
    value: 10,
    minOrder: 150000,
    desc: "10% off inaugural atelier order",
  },
  FIRST10: {
    type: "percentage",
    value: 10,
    minOrder: 150000,
    desc: "10% off inaugural atelier order",
  },
  GAYATRI20: {
    type: "fixed",
    value: 20000,
    minOrder: 200000,
    desc: "Flat ₹200 off fine linen orders",
  },
  SUMMER15: {
    type: "percentage",
    value: 15,
    minOrder: 250000,
    desc: "15% off Summer Linen Collection",
  },
};

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const coupon = VALID_COUPONS[cleanCode];

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (subtotal && subtotal < coupon.minOrder) {
      return NextResponse.json(
        { error: `Minimum order of ₹${coupon.minOrder / 100} required for this coupon` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.floor(((subtotal || 0) * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      valid: true,
      code: cleanCode,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.desc,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to validate coupon" }, { status: 500 });
  }
}
