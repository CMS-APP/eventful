import Foundation

func countdownParts(from now: Date, to target: Date) -> (days: Int, hours: Int, mins: Int) {
  let remaining = max(0, Int(target.timeIntervalSince(now)))
  return (remaining / 86400, (remaining % 86400) / 3600, (remaining % 3600) / 60)
}

func dateFormat(_ format: String, _ date: Date) -> String {
  let formatter = DateFormatter()
  formatter.dateFormat = format
  return formatter.string(from: date)
}

func guestCountLabel(_ count: Int) -> String {
  "\(count) \(count == 1 ? "GUEST" : "GUESTS")"
}
