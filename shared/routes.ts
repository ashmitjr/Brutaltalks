import { z } from 'zod';
import { wsMessageSchema } from './schema';

export const ws = {
  send: {
    join: z.object({}), 
    leave: z.object({}), 
    offer: z.object({ sdp: z.any() }),
    answer: z.object({ sdp: z.any() }),
    iceCandidate: z.object({ candidate: z.any() }),
  },
  receive: {
    paired: z.object({ partnerId: z.string(), initiator: z.boolean() }), 
    offer: z.object({ sdp: z.any(), from: z.string() }),
    answer: z.object({ sdp: z.any(), from: z.string() }),
    iceCandidate: z.object({ candidate: z.any(), from: z.string() }),
    partnerDisconnected: z.object({}),
    waiting: z.object({}),
  }
};

export const api = {
  health: {
    method: 'GET' as const,
    path: '/api/health' as const,
    responses: {
      200: z.object({ status: z.string() })
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}