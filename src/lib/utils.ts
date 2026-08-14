/** Join class names; falsy values drop out. */
export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Resolve a file in /public against the app's base path, so the built site
 * works from a domain root and from a repo subfolder alike.
 */
export function asset(file: string) {
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, "")}`;
}

export const EMAIL = "northsideweb2@gmail.com";
export const MAILTO = `mailto:${EMAIL}?subject=Website%20enquiry`;
