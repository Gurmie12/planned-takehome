import { NextRequest } from "next/server";
import { signAdminAuthToken, setAdminAuthCookie } from "@/lib/auth";


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;
        const adminPassword = process.env.ADMIN_USER_PASSWORD;

        if (!adminPassword) {
            return new Response("Admin password is not set in env (ADMIN_USER_PASSWORD)", { status: 500 });
        }

        if (!password) {
            return new Response("Password is required", { status: 400 });
        }

        if (password !== adminPassword) {
            return new Response("Invalid Credentials", { status: 401 });
        }

        const token = await signAdminAuthToken();
        await setAdminAuthCookie(token);

        return Response.json({ message: "Login successful", ok: true }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/auth/login", error);
        return new Response("Invalid Request", { status: 400 });
    }
}