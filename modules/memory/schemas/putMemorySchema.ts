import { z } from "zod";

export const patchMemorySchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    timestamp: z.iso.datetime().optional()
});

export type PatchMemorySchema = z.infer<typeof patchMemorySchema>;