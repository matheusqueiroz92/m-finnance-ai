import { IUser } from "./entities/IUser";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
