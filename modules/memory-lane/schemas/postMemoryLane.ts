import { z } from "zod";

export const postMemoryLaneSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    isPublic: z.boolean().optional()
});

export type PostMemoryLaneSchema = z.infer<typeof postMemoryLaneSchema>;