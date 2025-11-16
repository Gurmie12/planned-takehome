import { NextRequest } from "next/server";
import { clearAdminAuthCookie } from "@/lib/auth";

export async function POST(_request: NextRequest) {
    try {
        await clearAdminAuthCookie();
        return Response.json({ message: "Logout successful", ok: true }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/auth/logout", error);
        return new Response("Failed to logout", { status: 500 });
    }
}