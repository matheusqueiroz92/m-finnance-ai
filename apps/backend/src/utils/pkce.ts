import crypto from "crypto";

/**
 * Gera um code_verifier para PKCE
 * Deve ser um string aleatório de 43-128 caracteres
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Gera um code_challenge a partir do code_verifier
 * Usa SHA256 e codifica em base64url
 */
export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

/**
 * Valida se o code_verifier é válido
 */
export function validateCodeVerifier(verifier: string): boolean {
  return verifier.length >= 43 && verifier.length <= 128;
}

/**
 * Gera um state parameter para proteção CSRF
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Valida o state parameter
 */
export function validateState(
  receivedState: string,
  expectedState: string
): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(receivedState, "hex"),
    Buffer.from(expectedState, "hex")
  );
}
