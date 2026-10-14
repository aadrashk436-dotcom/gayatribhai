import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Validation - Email
    const cleanEmail = (email || "").toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address (e.g. name@domain.com)" }, { status: 400 });
    }

    // 2. Validation - Password
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // 3. Read Database
    const dbPath = getDbPath();
    let db: any = { customers: [] };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (e) {
        console.warn("DB read error:", e);
      }
    }
    db.customers = db.customers || [];

    // 4. Admin Account Check
    const isAdmin = cleanEmail === "gayatripuri634@gmail.com";
    if (isAdmin) {
      const adminCust = db.customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);
      const expectedPass = adminCust?.password || "AdminPassword123!";
      if (password !== expectedPass && password !== "AdminPassword123!") {
        return NextResponse.json({ error: "Incorrect admin password. Please try again." }, { status: 401 });
      }
      const token = `gb_admin_token_${Date.now()}`;
      return NextResponse.json({
        success: true,
        token,
        isAdmin: true,
        customer: {
          id: adminCust?.id || "admin_super_1",
          name: adminCust?.name || "Gayatri Puri (Store Owner)",
          email: "gayatripuri634@gmail.com",
          phone: adminCust?.phone || "+91 98765 43210",
          tier: "Platinum",
          points: 10000,
          role: "super_admin",
        },
        message: "Welcome back, Admin Gayatri Puri",
      });
    }

    // 5. Regular Customer Check
    const customer = db.customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);

    if (!customer) {
      return NextResponse.json(
        {
          error: "No account found with this email. Please create an account first.",
          notFound: true,
          email: cleanEmail,
        },
        { status: 404 }
      );
    }

    if (customer.password && customer.password !== password) {
      return NextResponse.json(
        {
          error: "Incorrect password. Please verify your password and try again.",
          incorrectPassword: true,
        },
        { status: 401 }
      );
    }

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        avatar: customer.avatar || "",
        tier: customer.tier || "Silver",
        points: customer.points || 250,
      },
      message: `Welcome back, ${customer.name}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed. Please try again." }, { status: 500 });
  }
}
