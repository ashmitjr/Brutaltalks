import { z } from "zod";

export const wsMessageSchema = z.object({
  type: z.enum(['join', 'leave', 'offer', 'answer', 'iceCandidate']),
  payload: z.any().optional(),
});
