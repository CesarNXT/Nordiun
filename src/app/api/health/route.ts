import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const clientOk = Boolean(auth) && Boolean(db);
  const adminOk = Boolean(adminAuth) && Boolean(adminDb);
  return NextResponse.json({
    client: clientOk ? "ok" : "missing",
    admin: adminOk ? "ok" : "missing",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
  });
}

