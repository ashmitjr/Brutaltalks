import { z } from "zod";

// We don't use Postgres/Drizzle for this app as it's purely in-memory WebRTC
export const wsMessageSchema = z.object({
  type: z.enum(['join', 'leave', 'offer', 'answer', 'iceCandidate']),
  payload: z.any().optional(),
});
