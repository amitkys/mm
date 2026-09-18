import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userSecurity } from "@/db/schema/export";
import { eq } from "drizzle-orm";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { pathname } = request.nextUrl;

    // 1. If user is trying to access /signin while already logged in
    if (session && pathname === "/signin") {
        return NextResponse.redirect(new URL("/expanses-log", request.url));
    }

    // 2. If user is NOT logged in and trying to access protected routes
    if (!session && pathname !== "/signin") {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // 3. If user IS logged in, enforce 4-digit PIN security server-side before rendering pages
    if (session) {
        // Query user Security record directly from DB
        const [secRecord] = await db
            .select({ id: userSecurity.id })
            .from(userSecurity)
            .where(eq(userSecurity.userId, session.user.id));

        const hasPin = Boolean(secRecord);
        const pinVerified = request.cookies.get("mm_pin_verified")?.value === "true";

        // Case A: User has NOT set up a 4-digit PIN yet -> redirect to /setup-pin
        if (!hasPin) {
            if (pathname !== "/setup-pin") {
                return NextResponse.redirect(new URL("/setup-pin", request.url));
            }
            return NextResponse.next();
        }

        // Case B: User HAS a PIN, but session is NOT verified (new tab / browser reopen) -> redirect to /verify-pin
        if (hasPin && !pinVerified) {
            if (pathname !== "/verify-pin") {
                return NextResponse.redirect(new URL("/verify-pin", request.url));
            }
            return NextResponse.next();
        }

        // Case C: User HAS a PIN and session IS verified -> prevent visiting /setup-pin or /verify-pin
        if (hasPin && pinVerified) {
            if (pathname === "/setup-pin" || pathname === "/verify-pin") {
                return NextResponse.redirect(new URL("/expanses-log", request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
        "/income",
        "/expanses-log",
        "/expanses-category",
        "/home",
        "/signin",
        "/setup-pin",
        "/verify-pin",
    ],
};
