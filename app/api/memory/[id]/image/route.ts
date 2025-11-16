import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { postMemoryImageSchema } from "@/modules/memory-image/schemas/postMemoryImage";

type MemoryContext = {  
    params: Promise<{id: string}>;
}

export async function POST(request: NextRequest, { params }: MemoryContext) {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    if (!id) {
        return new Response("Memory ID is required", { status: 400 });
    }

    const memory = await db.memory.findUnique({
        where: { id },
    });

    if (!memory) {
        return new Response("Memory not found", { status: 404 });
    }

    try {
        const body = await request.json();
        const { success, data, error } = postMemoryImageSchema.safeParse(body);
        
        if (!success && error) {
            const errorTree = z.treeifyError(error);
            return Response.json(errorTree, {status: 400});
        }
        
        const { blobUrl, blobPath, order } = data;
        
        const memoryImage = await db.memoryImage.create({
            data: {
                memoryId: id,
                blobUrl,
                blobPath,
                order,
            },
        });

        return Response.json(memoryImage, { status: 201 });
    } catch (error) {
        console.error("Error in /api/memory/[id]/image", error);
        return new Response("Failed to create memory image", { status: 400 });
    }
}