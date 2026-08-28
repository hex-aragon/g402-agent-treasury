import {z} from "zod";
export const UploadMetadataSchema=z.object({filename:z.string().min(1).max(500).optional(),contentType:z.string().max(160).optional(),tags:z.array(z.string().min(1).max(80).regex(/^[a-zA-Z0-9._-]+$/)).max(20).default([]),retentionDays:z.number().int().min(1).max(3650).default(30),replicas:z.number().int().min(1).max(10).default(2)}).strict();
export const SearchSchema=z.object({query:z.string().max(200).default(""),tags:z.array(z.string().max(80)).max(20).default([]),limit:z.number().int().min(1).max(100).default(20)}).strict();
export type UploadMetadata=z.infer<typeof UploadMetadataSchema>;
