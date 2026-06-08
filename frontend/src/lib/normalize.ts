/** Handles both plain arrays and Spring Page<T> paginated responses */
export function toArray<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && 'content' in (data as object)) {
    const content = (data as { content: unknown }).content;
    return Array.isArray(content) ? (content as T[]) : [];
  }
  return [];
}
