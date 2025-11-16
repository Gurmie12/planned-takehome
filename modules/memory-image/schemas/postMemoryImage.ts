import { z } from "zod";

export const postMemoryImageSchema = z.object({
    blobUrl: z.url(),
    blobPath: z.string().min(1, 'Blob path is required'),
    order: z.number().min(0, 'Order is required'),
});

export type PostMemoryImageSchema = z.infer<typeof postMemoryImageSchema>;