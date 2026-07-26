import type { AuthIdentity } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      authIdentity?: AuthIdentity;
    }
  }
}

export {};
