import express from "express";
import { container } from "../config/container";
import { WhatsAppWebhookController } from "../controllers/WhatsAppWebhookController";
import { validateTwilioSignature } from "../middlewares/twilioWebhookMiddleware";

const router = express.Router();
const webhookController = container.resolve(WhatsAppWebhookController);

/**
 * Webhook público (sem JWT) para o Twilio enviar mensagens recebidas no WhatsApp.
 * Validação via X-Twilio-Signature. Body: application/x-www-form-urlencoded.
 */
router.post(
  "/webhook",
  validateTwilioSignature,
  webhookController.handleIncomingMessage
);

export default router;
