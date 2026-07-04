// Intentionally permissive: catches obvious typos (missing @, missing
// domain dot, embedded spaces) without rejecting unusual-but-valid
// addresses. Real deliverability checks belong to the email provider.
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
