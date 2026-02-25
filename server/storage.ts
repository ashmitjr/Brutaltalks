import { WebSocket } from "ws";

export interface UserSession {
  id: string;
  ws: WebSocket;
  partnerId?: string;
  isSearching: boolean;
}

export interface IStorage {
  addUser(id: string, ws: WebSocket): void;
  removeUser(id: string): void;
  getUser(id: string): UserSession | undefined;
  getWaitingUser(excludeId: string): UserSession | undefined;
  pairUsers(id1: string, id2: string): void;
  unpairUser(id: string): void;
  setSearching(id: string, searching: boolean): void;
}

export class MemStorage implements IStorage {
  private users: Map<string, UserSession>;

  constructor() {
    this.users = new Map();
  }

  addUser(id: string, ws: WebSocket) {
    this.users.set(id, { id, ws, isSearching: false });
  }

  removeUser(id: string) {
    const user = this.users.get(id);
    if (user?.partnerId) {
      this.unpairUser(id);
    }
    this.users.delete(id);
  }

  getUser(id: string) {
    return this.users.get(id);
  }

  getWaitingUser(excludeId: string) {
    for (const user of this.users.values()) {
      if (user.isSearching && user.id !== excludeId) {
        return user;
      }
    }
    return undefined;
  }

  pairUsers(id1: string, id2: string) {
    const u1 = this.users.get(id1);
    const u2 = this.users.get(id2);
    if (u1 && u2) {
      u1.partnerId = id2;
      u1.isSearching = false;
      u2.partnerId = id1;
      u2.isSearching = false;
    }
  }

  unpairUser(id: string) {
    const user = this.users.get(id);
    if (user?.partnerId) {
      const partner = this.users.get(user.partnerId);
      if (partner) {
        partner.partnerId = undefined;
        partner.isSearching = false;
      }
      user.partnerId = undefined;
    }
  }

  setSearching(id: string, searching: boolean) {
    const user = this.users.get(id);
    if (user) {
      user.isSearching = searching;
    }
  }
}

export const storage = new MemStorage();