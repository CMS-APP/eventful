export function isValidUserId(
  userId: string | null | undefined
): userId is string {
  return !!userId && userId !== "null";
}
