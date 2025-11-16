import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { postMemoryLaneSchema } from "@/modules/memory-lane/schemas/postMemoryLane";
import { z } from "zod";

export async function POST(request: NextRequest) {
    const isAdmin = await isAdminAuthenticated();
    
    if (!isAdmin) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json()
        const { success, data, error } = postMemoryLaneSchema.safeParse(body);
        
        if (!success && error) {
            const errorTree = z.treeifyError(error);

            return Response.json(errorTree, {status: 400});
        }

        const { title, description, isPublic } = data;

        const memoryLane = await db.memoryLane.create({
            data: { title, description, isPublic },
        });

        return Response.json(memoryLane, { status: 201 });
    } catch (error) {
        console.error("Error in /api/memory-lane", error);
        return new Response("Failed to create memory", { status: 400 });
    }
}