import photoPrompts from "@/assets/data/photoPrompts.json";

export function getRandomPrompts(count: number): string[] {
  const pool = [...photoPrompts];
  const result: string[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }

  return result;
}
