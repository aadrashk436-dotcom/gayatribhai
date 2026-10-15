export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getShiprocketServiceability } from "@/lib/shiprocket";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode") || "400001";
    const isCod = searchParams.get("isCod") === "true";
    const weight = parseFloat(searchParams.get("weight") || "0.5") || 0.5;

    const rawData = await getShiprocketServiceability(pincode, isCod, weight);

    const availableCouriers =
      rawData?.data?.available_courier_companies || [];

    if (Array.isArray(availableCouriers) && availableCouriers.length > 0) {
      const formatted = availableCouriers.map((c: any, idx: number) => ({
        id: c.courier_company_id,
        courierId: c.courier_company_id,
        name: c.courier_name || "Express Courier",
        rate: Math.round(Number(c.rate) || 95),
        rateFormatted: `₹${Math.round(Number(c.rate) || 95)}`,
        etd: c.etd || "2-3 Business Days",
        sla: c.etd ? `Estimated Delivery: ${c.etd}` : "2-3 Business Days",
        rating: Number(c.rating) || 4.2,
        recommended: idx === 0,
      }));

      return NextResponse.json({
        success: true,
        pincode,
        couriers: formatted,
      });
    }

    // Default fallback if Shiprocket has no direct rates for this pincode
    const fallbackCouriers = [
      {
        id: 1,
        courierId: 1,
        name: "Blue Dart Express Air",
        rate: 95,
        rateFormatted: "₹95",
        etd: "24-48 Hours",
        sla: "Next Day Air (24-48 hrs)",
        rating: 4.8,
        recommended: true,
      },
      {
        id: 58,
        courierId: 58,
        name: "Shadowfax Surface",
        rate: 55,
        rateFormatted: "₹55",
        etd: "2-3 Days",
        sla: "2-3 Business Days",
        rating: 4.5,
        recommended: false,
      },
      {
        id: 51,
        courierId: 51,
        name: "Xpressbees Surface",
        rate: 49,
        rateFormatted: "₹49",
        etd: "2-4 Days",
        sla: "2-4 Business Days",
        rating: 4.3,
        recommended: false,
      },
    ];

    return NextResponse.json({
      success: true,
      pincode,
      couriers: fallbackCouriers,
    });
  } catch (err: any) {
    console.warn("Serviceability API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch live courier rates",
        couriers: [
          {
            id: 1,
            courierId: 1,
            name: "Blue Dart Express Air",
            rate: 95,
            rateFormatted: "₹95",
            etd: "24-48 Hours",
            sla: "Next Day Air (24-48 hrs)",
            rating: 4.8,
            recommended: true,
          },
          {
            id: 58,
            courierId: 58,
            name: "Shadowfax Surface",
            rate: 55,
            rateFormatted: "₹55",
            etd: "2-3 Days",
            sla: "2-3 Business Days",
            rating: 4.5,
            recommended: false,
          },
        ],
      },
      { status: 200 }
    );
  }
}
