export const generateSessionId = (): string => {
  const bitPattern = 256; // 256 bits = 32 bytes = 64 hex characters
  const bin = new Uint8Array(bitPattern / 8);
  crypto.getRandomValues(bin);
  return Array.from(bin)
    .map((n: number): string => n.toString(16).padStart(2, "0"))
    .join("");
};

export const isValidSessionId = (sessionId: string): boolean => {
  // TODO: Add unit tests
  return /^[0-9a-f]{64,}$/.test(sessionId);
};
