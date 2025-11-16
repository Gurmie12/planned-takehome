import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { postMemorySchema } from "@/modules/memory/schemas/postMemorySchema";
import {z} from "zod";

type PostMemoryContext = {
    params: Promise<{id: string}>;
}

export async function POST(request: NextRequest, { params }: PostMemoryContext) {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
        return new Response("Memory ID is required", { status: 400 });
    }

    const memoryLane = await db.memoryLane.findUnique({
        where: { id },
    });

    if (!memoryLane) {
        return new Response("Memory lane not found", { status: 404 });
    }

    try {
        const body = await request.json();
        const { success, data, error } = postMemorySchema.safeParse(body);
        
        if (!success && error) {
            const errorTree = z.treeifyError(error);
            return Response.json(errorTree, {status: 400});
        }
        
        const { title, description, timestamp, images } = data;
        
        const memory = await db.$transaction(async tx => {
            const memory = await tx.memory.create({
                data: {
                    title,
                    description,
                    timestamp,
                    memoryLaneId: id,
                },
            });
            
            await tx.memoryImage.createMany({
                data: images.map(image => ({
                    ...image,
                    memoryId: memory.id,
                })),
            });
            
            return memory;
        })

        return Response.json(memory, { status: 201 });
    } catch (error) {
        console.error("Error in /api/memory-lane/[id]/memory", error);
        return new Response("Failed to create memory", { status: 400 });
    }
}