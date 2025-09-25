import "express-session";

declare module "express-session" {
  interface SessionData {
    codeVerifier?: string;
    oauthState?: string;
    userId?: string;
  }
}
