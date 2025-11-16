import { z } from "zod";
import { postMemoryImageSchema } from "@/modules/memory-image/schemas/postMemoryImage";

export const postMemorySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    timestamp: z.iso.datetime(),
    images: z.array(postMemoryImageSchema).min(1, 'At least one image is required'),
});

export type PostMemorySchema = z.infer<typeof postMemorySchema>;