import leoProfanity from "leo-profanity";

function normalizeObfuscation(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");
}

export function containsProfanity(input: string): boolean {
  const cleaned = normalizeObfuscation(input);

  if (leoProfanity.check(input)) return true;

  return leoProfanity.list().some((word: string) => cleaned.includes(word));
}
