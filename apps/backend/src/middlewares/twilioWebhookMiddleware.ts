import { Request, Response, NextFunction } from "express";
import twilio from "twilio";

const authToken = process.env.TWILIO_AUTH_TOKEN;

/**
 * Valida que a requisição veio do Twilio usando o header X-Twilio-Signature.
 * Deve ser usado apenas nas rotas de webhook do Twilio (ex.: POST /api/whatsapp/webhook).
 * Requer que express.urlencoded() já tenha parseado o body (req.body disponível).
 */
export function validateTwilioSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers["x-twilio-signature"] as string | undefined;
  if (!signature) {
    res.status(400).type("text/plain").send("Missing X-Twilio-Signature header");
    return;
  }
  if (!authToken) {
    console.error("[Twilio] TWILIO_AUTH_TOKEN not set - webhook validation disabled");
    res.status(500).type("text/plain").send("Webhook validation not configured");
    return;
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host") || "";
  const url = `${protocol}://${host}${req.originalUrl}`;
  const isValid = twilio.validateRequest(
    authToken,
    signature,
    url,
    req.body || {}
  );
  if (!isValid) {
    res.status(403).type("text/plain").send("Twilio Request Validation Failed.");
    return;
  }
  next();
}
