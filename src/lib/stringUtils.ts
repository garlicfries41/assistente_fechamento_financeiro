/**
 * Normalizes a string by removing accents and converting to lowercase
 * for case-insensitive and accent-insensitive comparisons
 */
export function normalizeString(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

/**
 * Checks if a string contains another string (case and accent insensitive)
 */
export function containsInsensitive(haystack: string, needle: string): boolean {
    return normalizeString(haystack).includes(normalizeString(needle));
}

/**
 * Checks if two strings are equal (case and accent insensitive)
 */
export function equalsInsensitive(str1: string, str2: string): boolean {
    return normalizeString(str1) === normalizeString(str2);
}
