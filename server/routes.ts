import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    const userId = randomUUID();
    storage.addUser(userId, ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { type, payload } = data;
        const user = storage.getUser(userId);
        if (!user) return;

        if (type === 'join') {
          // If already paired, unpair first
          if (user.partnerId) {
            const partner = storage.getUser(user.partnerId);
            storage.unpairUser(userId);
            if (partner) {
              partner.ws.send(JSON.stringify({ type: 'partnerDisconnected' }));
            }
          }
          
          const waitingUser = storage.getWaitingUser(userId);
          if (waitingUser) {
            storage.pairUsers(userId, waitingUser.id);
            // Initiate connection, we let waitingUser be initiator
            waitingUser.ws.send(JSON.stringify({ type: 'paired', payload: { partnerId: userId, initiator: true } }));
            ws.send(JSON.stringify({ type: 'paired', payload: { partnerId: waitingUser.id, initiator: false } }));
          } else {
            // Wait
            storage.setSearching(userId, true);
            ws.send(JSON.stringify({ type: 'waiting' }));
          }
        } else if (type === 'leave') {
          if (user.partnerId) {
            const partner = storage.getUser(user.partnerId);
            storage.unpairUser(userId);
            if (partner) {
              partner.ws.send(JSON.stringify({ type: 'partnerDisconnected' }));
            }
          }
          storage.setSearching(userId, false);
          // Don't send anything else, let client decide what to do
        } else if (['offer', 'answer', 'iceCandidate'].includes(type)) {
          if (user.partnerId) {
            const partner = storage.getUser(user.partnerId);
            if (partner) {
              partner.ws.send(JSON.stringify({
                type,
                payload: { ...payload, from: userId }
              }));
            }
          }
        }
      } catch (err) {
        console.error('WS message error', err);
      }
    });

    ws.on('close', () => {
      const user = storage.getUser(userId);
      if (user?.partnerId) {
        const partner = storage.getUser(user.partnerId);
        if (partner) {
          partner.ws.send(JSON.stringify({ type: 'partnerDisconnected' }));
        }
      }
      storage.removeUser(userId);
    });
  });

  app.get(api.health.path, (req, res) => {
    res.json({ status: 'ok' });
  });

  return httpServer;
}