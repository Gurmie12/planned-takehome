import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { del } from "@vercel/blob";

type DeleteMemoryLaneContext = {
    params: Promise<{id: string}>;
}

export async function DELETE(_request: NextRequest, { params }: DeleteMemoryLaneContext) {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    if (!id) {
        return new Response("Memory lane ID is required", { status: 400 });
    }

    try {
        const memoryLane = await db.memoryLane.findUnique({
            where: { id },
            include: {
                memories: {
                    include: {
                        images: true,
                    },
                },
            }
        });

        if (!memoryLane) {
            return new Response("Memory lane not found", { status: 404 });
        }

        
        await db.$transaction(async tx => {
            await tx.memoryLane.delete({
                where: { id },
            });

            await tx.memory.deleteMany({
                where: { memoryLaneId: id },
            });

            await tx.memoryImage.deleteMany({
                where: { memoryId: { in: memoryLane.memories.map(memory => memory.id) } },
            });

            await del(memoryLane.memories.flatMap(memory => memory.images.map(image => image.blobPath)));
        });

        return new Response("Memory lane deleted", { status: 200 });
    } catch (error) {
        console.error("Error in /api/memory-lane/[id]", error);
        return new Response("Failed to delete memory lane", { status: 500 });
    }
}    