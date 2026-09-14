import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { pathname } = request.nextUrl;

    // If user is trying to access /signin while already logged in
    if (session && pathname === "/signin") {
        return NextResponse.redirect(new URL("/expanses-log", request.url));
    }

    // If user is not logged in and trying to access protected routes
    if (!session && pathname !== "/signin") {
        return NextResponse.redirect(new URL("/signin", request.url));
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
    ],
};
