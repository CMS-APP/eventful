import SwiftUI

struct SmallEventView: View {
  let event: NextEventPayload
  let now: Date

  private var targetDate: Date { Date(timeIntervalSince1970: event.dateMs / 1000) }
  private var isHost: Bool { event.isHost == 1 }
  private var parts: (days: Int, hours: Int, mins: Int) { countdownParts(from: now, to: targetDate) }

  private var backgroundColor: Color { isHost ? .eventfulPrimary : .eventfulSecondary }
  private var foregroundColor: Color { isHost ? .eventfulWhite : .eventfulPrimary }
  private var accentColor: Color { isHost ? .eventfulSecondary : .eventfulPrimary }
  private var subtitle: String { isHost ? "HOSTED BY YOU" : event.hostName.uppercased() }
  private var dateLabel: String { dateFormat("EEE dd MMM", targetDate).uppercased() }

  private var countdownUnits: [(value: Int, label: String)] {
    var units: [(value: Int, label: String)] = []
    if parts.days > 0 { units.append((parts.days, parts.days == 1 ? "DAY" : "DAYS")) }
    if parts.hours > 0 { units.append((parts.hours, parts.hours == 1 ? "HR" : "HRS")) }
    if units.isEmpty { units.append((parts.mins, parts.mins == 1 ? "MIN" : "MINS")) }
    return units
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack {
        Text(dateLabel)
          .font(.eventfulLabel(11))
          .tracking(0.5)
          .foregroundColor(accentColor)
        Spacer()
        Image(systemName: "note.text")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(accentColor)
      }

      Spacer()

      HStack(alignment: .top, spacing: 14) {
        ForEach(countdownUnits, id: \.label) { unit in
          countdownUnit(value: unit.value, label: unit.label)
        }
      }

      Text(event.name)
        .font(.eventfulSerif(17))
        .foregroundColor(foregroundColor)
        .lineLimit(1)
        .padding(.top, 4)

      Text(subtitle)
        .font(.eventfulLabel(10))
        .tracking(0.5)
        .foregroundColor(foregroundColor.opacity(0.7))
        .lineLimit(1)
        .padding(.top, 1)
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(backgroundColor)
  }

  @ViewBuilder
  private func countdownUnit(value: Int, label: String) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      Text("\(value)")
        .font(.eventfulSerif(30))
        .foregroundColor(foregroundColor)
      Text(label)
        .font(.eventfulLabel(10))
        .tracking(0.5)
        .foregroundColor(accentColor)
    }
  }
}
