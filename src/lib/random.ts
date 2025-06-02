export const generateRandomHex = (bit: number): string => {
  const bin = new Uint8Array(Math.ceil(bit / 8));
  crypto.getRandomValues(bin);
  return Array.from(bin)
    .map((n: number): string => n.toString(16).padStart(2, "0"))
    .join("");
};
