import Foundation
import SwiftUI
import WidgetKit

struct EventfulWidgetEntryView: View {
  @Environment(\.widgetFamily) private var family
  var entry: Provider.Entry

  private var deepLinkURL: URL? {
    guard let event = entry.event, !event.eventId.isEmpty else { return nil }

    var components = URLComponents()
    components.scheme = "eventful"
    components.host = "open"

    var queryItems = [
      URLQueryItem(name: "source", value: "widget"),
      URLQueryItem(name: "eventId", value: event.eventId)
    ]

    if event.isHost == 1 {
      queryItems.append(URLQueryItem(name: "type", value: "host"))
    } else {
      queryItems.append(URLQueryItem(name: "type", value: "guest"))
      queryItems.append(URLQueryItem(name: "inviteId", value: event.inviteId))
      queryItems.append(URLQueryItem(name: "hostId", value: event.hostId))
    }

    components.queryItems = queryItems
    return components.url
  }

  var body: some View {
    Group {
      if let event = entry.event {
        switch family {
        case .systemMedium:
          MediumEventView(event: event, now: entry.date)
        default:
          SmallEventView(event: event, now: entry.date)
        }
      } else {
        EmptyEventView()
      }
    }
    .widgetURL(deepLinkURL)
  }
}

@main
struct EventfulWidget: Widget {
  let kind: String = "EventfulWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      EventfulWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Eventful")
    .description("Keep up with your next event.")
    .supportedFamilies([.systemSmall, .systemMedium])
    .contentMarginsDisabled()
  }
}
