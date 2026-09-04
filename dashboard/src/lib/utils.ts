import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Helper padrão do shadcn/ui: junta classes condicionais resolvendo conflitos do Tailwind. */
export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
