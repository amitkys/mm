import { NextRequest, NextResponse } from "next/server";
import { getPinAccessState } from "@/lib/pin-access";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const access = await getPinAccessState(request.headers);

    if (access.status === "unauthenticated") {
        if (pathname !== "/signin") {
            return NextResponse.redirect(new URL("/signin", request.url));
        }

        return NextResponse.next();
    }

    if (access.status === "setup_required") {
        if (pathname !== "/setup-pin") {
            return NextResponse.redirect(new URL("/setup-pin", request.url));
        }

        return NextResponse.next();
    }

    if (access.status === "locked") {
        if (pathname !== "/verify-pin") {
            return NextResponse.redirect(new URL("/verify-pin", request.url));
        }

        return NextResponse.next();
    }

    if (
        pathname === "/signin" ||
        pathname === "/setup-pin" ||
        pathname === "/verify-pin"
    ) {
        return NextResponse.redirect(new URL("/expanses-log", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};
