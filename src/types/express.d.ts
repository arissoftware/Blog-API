import { DBUsers } from "./type.ts";

declare global {
  namespace Express {
    interface Request {
      user?: DBUsers;
    }
  }
}

export {};
