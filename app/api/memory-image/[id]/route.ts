import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { del } from "@vercel/blob";

type MemoryImageContext = {
    params: Promise<{id: string}>;
}

export async function DELETE(request: NextRequest, { params }: MemoryImageContext) {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    if (!id) {
        return new Response("Memory image ID is required", { status: 400 });
    }
    
    const memoryImage = await db.memoryImage.findUnique({
        where: { id },
    });

    if (!memoryImage) {
        return new Response("Memory image not found", { status: 404 });
    }

    try {
        await db.$transaction(async tx => {
            await tx.memoryImage.delete({
                where: { id },
            });

            await del(memoryImage.blobPath);
        });

        return new Response("Memory image deleted", { status: 200 });
    } catch (error) {
        console.error("Error in /api/memory-image/[id]", error);
        return new Response("Failed to delete memory image", { status: 500 });
    }
}