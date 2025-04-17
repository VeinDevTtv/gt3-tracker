import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and then merges Tailwind classes with tailwind-merge
 * to avoid conflicts and ensure proper cascading of styles.
 *
 * @param {...string} inputs - Class names to combine and merge
 * @returns {string} - Merged class names string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 