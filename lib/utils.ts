export { cn } from "cn"

import { nanoid } from 'nanoid';

/**
 * Generates a prefixed unique ID.
 * @param {string} prefix - The category prefix (e.g., 'user', 'ride').
 * @param {number} [length=10] - Optional custom length for the ID part.
 * @returns {string} The formatted ID string.
 */
export const generateUniqueId = (prefix: string, length: number = 10): string => {
    return `${prefix}-${nanoid(length)}`;
};
