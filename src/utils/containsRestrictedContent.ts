const restrictedPatterns = [
  /\b\d{10,}\b/, // 10+ digits (possible phone number)
  /\+?\d{1,4}[-.\s]?\d{6,}/, // international phone numbers
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // email
  /\b(contact me|call me|phone|email me)\b/i, // keywords
];

export const containsRestrictedContent = (text: string): boolean => {
  return restrictedPatterns.some((pattern) => pattern.test(text));
}