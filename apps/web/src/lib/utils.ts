import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte string ISO/YYYY-MM-DD em Date no fuso local.
 * Evita o deslocamento de 1 dia quando a API retorna data em UTC (ex: 02/02 vira 01/02 no Brasil).
 */
export function parseLocalDate(dateValue: string | Date): Date {
  if (typeof dateValue === "string") {
    const s = dateValue.slice(0, 10)
    const [y, m, d] = s.split("-").map(Number)
    return new Date(y, m - 1, d)
  }
  return dateValue
}