export { cn } from "cn";
import { nanoid } from "nanoid";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  NumberDictionary,
} from "unique-names-generator";

/**
 * Generates a prefixed unique ID.
 * @param {string} prefix - The category prefix (e.g., 'user', 'ride').
 * @param {number} [length=10] - Optional custom length for the ID part.
 * @returns {string} The formatted ID string.
 */
export const generateUniqueId = (prefix: string, length: number = 10): string => {
  return `${prefix}-${nanoid(length)}`;
};

/**
 * Generates Docker-style human-readable unique names (e.g. "brave-dolphin-42", "swift-tiger-87").
 */
export const generateReadableName = (): string => {
  const numberDict = NumberDictionary.generate({ min: 1, max: 99 });
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals, numberDict],
    separator: "-",
    style: "lowerCase",
  });
};
