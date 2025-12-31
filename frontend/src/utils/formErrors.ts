export const normalizeFieldKey = (raw: string): string => {
  // Raw keys may look like: "Email", "RegisterRequest.Email", "resetAnswers[0].answer"
  // We want to map to component field names: "email", "password", "confirmPassword", etc.
  if (!raw) return raw;
  // Take the last segment after a dot
  const afterDot = raw.split('.').pop() ?? raw;
  // Remove array indices: foo[0] -> foo
  const noArray = afterDot.replace(/\[\d+\]/g, '');
  // Trim and lower-case first char (PascalCase -> camelCase)
  const trimmed = noArray.trim();
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
};

export const applyFieldErrors = (setErrors: (s: Partial<Record<string, string>>) => void, fieldErrors: Record<string, string[]>) => {
  if (!fieldErrors) return;
  const mapped: Partial<Record<string, string>> = {};
  for (const rawKey of Object.keys(fieldErrors)) {
    const key = normalizeFieldKey(rawKey);
    const val = fieldErrors[rawKey];
    mapped[key] = Array.isArray(val) ? val.join(' ') : String(val);
  }
  setErrors(mapped);
};
