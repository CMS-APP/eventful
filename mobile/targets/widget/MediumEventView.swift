import SwiftUI

struct MediumEventView: View {
  let event: NextEventPayload
  let now: Date

  private var targetDate: Date { Date(timeIntervalSince1970: event.dateMs / 1000) }
  private var isHost: Bool { event.isHost == 1 }
  private var parts: (days: Int, hours: Int, mins: Int) { countdownParts(from: now, to: targetDate) }

  private var subtitle: String {
    isHost ? "HOSTED BY YOU · \(guestCountLabel(event.guestCount))" : event.hostName.uppercased()
  }

  var body: some View {
    HStack(alignment: .top, spacing: 14) {
      VStack(spacing: 0) {
        Text(dateFormat("MMM", targetDate).uppercased())
          .font(.eventfulLabel(10))
          .tracking(0.5)
        Text(dateFormat("dd", targetDate))
          .font(.eventfulSerif(22))
        Text(dateFormat("EEE", targetDate).uppercased())
          .font(.eventfulLabel(9))
          .tracking(0.5)
      }
      .foregroundColor(.eventfulPrimary)
      .frame(width: 56, height: 78)
      .background(Color.eventfulSecondary)
      .clipShape(RoundedRectangle(cornerRadius: 14))

      VStack(alignment: .leading, spacing: 6) {
        HStack(alignment: .top) {
          Text(event.name)
            .font(.eventfulSerif(20))
            .foregroundColor(.eventfulWhite)
            .lineLimit(1)
          Spacer()
          Image(systemName: "note.text")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.eventfulSecondary)
        }

        HStack(spacing: 12) {
          Label(isHost ? "You" : event.hostName, systemImage: "person.fill")
          Label(dateFormat("HH:mm", targetDate), systemImage: "clock")
        }
        .font(.eventfulBody(11))
        .foregroundColor(.eventfulWhite.opacity(0.8))
        .labelStyle(.titleAndIcon)

        Spacer(minLength: 4)

        HStack(spacing: 18) {
          countdownUnit(value: parts.days, label: "DAYS")
          countdownUnit(value: parts.hours, label: "HOURS")
          countdownUnit(value: parts.mins, label: "MINS")
        }

        Text(subtitle)
          .font(.eventfulLabel(10))
          .tracking(0.5)
          .foregroundColor(.eventfulWhite.opacity(0.7))
          .lineLimit(1)
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(Color.eventfulPrimary)
  }

  @ViewBuilder
  private func countdownUnit(value: Int, label: String) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      Text(String(format: "%02d", value))
        .font(.eventfulSerif(26))
        .foregroundColor(.eventfulWhite)
      Text(label)
        .font(.eventfulLabel(9))
        .tracking(0.5)
        .foregroundColor(.eventfulSecondary)
    }
  }
}
