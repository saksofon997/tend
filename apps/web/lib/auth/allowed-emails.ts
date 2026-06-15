function parseAllowedEmails(): Set<string> | null {
  const raw = process.env.ALLOWED_EMAILS?.trim();
  if (!raw) {
    return null;
  }

  const emails = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length === 0) {
    return null;
  }

  return new Set(emails);
}

export function isRegistrationRestricted(): boolean {
  return parseAllowedEmails() !== null;
}

export function isEmailAllowed(email: string): boolean {
  const allowed = parseAllowedEmails();
  if (!allowed) {
    return true;
  }

  return allowed.has(email.trim().toLowerCase());
}
