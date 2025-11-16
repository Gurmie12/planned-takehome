import { NextRequest } from "next/server";
import { del } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { patchMemorySchema } from "@/modules/memory/schemas/putMemorySchema";
import { z } from "zod";

type MemoryContext = {
    params: Promise<{id: string}>;
}

export async function PATCH(request: NextRequest, { params }: MemoryContext) {
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
        const { success, data, error } = patchMemorySchema.safeParse(body);
        
        if (!success && error) {
            const errorTree = z.treeifyError(error);
            return Response.json(errorTree, {status: 400});
        }
        
        const { title, description, timestamp } = data;
        
        const updatedMemory = await db.memory.update({
            where: { id },
            data: { title, description, timestamp },
        });

        return Response.json(updatedMemory, { status: 200 });
    } catch (error) {
        console.error("Error in /api/memory/[id]", error);
        return new Response("Failed to update memory", { status: 400 });
    }
}

export async function DELETE(_request: NextRequest, { params }: MemoryContext) {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return new Response("Memory ID is required", { status: 400 });
  }

  try {
    const memory = await db.memory.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!memory) {
      return new Response("Memory not found", { status: 404 });
    }

    const blobPaths = memory.images.map((image) => image.blobPath);

    await db.memory.delete({
      where: { id },
    });

    if (blobPaths.length > 0) {
      try {
        await del(blobPaths);
      } catch (error) {
        console.error(
          "Failed to delete one or more blobs for memory",
          id,
          error
        );
        // We do not fail the entire request here since the DB state is already consistent.
      }
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error in /api/memory/[id]", error);
    return new Response("Failed to delete memory", { status: 500 });
  }
}