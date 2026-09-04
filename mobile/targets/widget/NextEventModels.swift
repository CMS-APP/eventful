import WidgetKit

struct NextEventPayload: Codable {
  let name: String
  let dateMs: Double
  let isHost: Int
  let hostName: String
  let guestCount: Int
  let eventId: String
  let hostId: String
  let inviteId: String
}

struct NextEventEntry: TimelineEntry {
  let date: Date
  let event: NextEventPayload?
}
