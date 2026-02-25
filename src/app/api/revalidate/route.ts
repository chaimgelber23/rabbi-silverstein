import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the Firebase ID token using Admin SDK
    const token = authHeader.split("Bearer ")[1];
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.length === 0 || !adminEmails.includes(decoded.email?.toLowerCase() || "")) {
      return NextResponse.json({ error: "Not admin" }, { status: 403 });
    }

    const { path } = await request.json();

    // Revalidate all pages (layout-level revalidation covers everything)
    revalidatePath("/", "layout");
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
