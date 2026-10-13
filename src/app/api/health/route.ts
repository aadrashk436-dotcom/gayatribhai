import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Gayatri Bhai E-Commerce Cloud Platform",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
}
