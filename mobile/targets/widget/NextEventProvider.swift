import WidgetKit
import os.log

private let widgetLog = Logger(subsystem: "com.hostinghappily.app.widget", category: "timeline")

struct Provider: TimelineProvider {
  static var appGroup: String {
    let bundleId = Bundle.main.bundleIdentifier ?? ""
    let mainAppBundleId = bundleId.hasSuffix(".widget")
      ? String(bundleId.dropLast(".widget".count))
      : bundleId
    return "group.\(mainAppBundleId)"
  }

  static func loadNextEvent() -> NextEventPayload? {
    widgetLog.log("loadNextEvent: appGroup=\(appGroup, privacy: .public)")

    guard let defaults = UserDefaults(suiteName: appGroup) else {
      widgetLog.error("loadNextEvent: UserDefaults(suiteName:) returned nil for \(appGroup, privacy: .public)")
      return nil
    }

    guard let data = defaults.data(forKey: "nextEvent") else {
      widgetLog.log("loadNextEvent: no data for key 'nextEvent'")
      return nil
    }

    do {
      let payload = try JSONDecoder().decode(NextEventPayload.self, from: data)
      widgetLog.log("loadNextEvent: decoded event '\(payload.name, privacy: .public)' dateMs=\(payload.dateMs)")
      return payload
    } catch {
      widgetLog.error("loadNextEvent: decode failed: \(String(describing: error), privacy: .public)")
      return nil
    }
  }

  func placeholder(in context: Context) -> NextEventEntry {
    NextEventEntry(date: Date(), event: Self.loadNextEvent())
  }

  func getSnapshot(in context: Context, completion: @escaping (NextEventEntry) -> Void) {
    completion(NextEventEntry(date: Date(), event: Self.loadNextEvent()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<NextEventEntry>) -> Void) {
    let now = Date()
    widgetLog.log("getTimeline: called at \(now.description, privacy: .public)")

    guard let event = Self.loadNextEvent() else {
      widgetLog.log("getTimeline: no event, showing empty state")
      let timeline = Timeline(
        entries: [NextEventEntry(date: now, event: nil)],
        policy: .after(now.addingTimeInterval(30 * 60))
      )
      completion(timeline)
      return
    }

    let targetDate = Date(timeIntervalSince1970: event.dateMs / 1000)

    guard targetDate > now else {
      widgetLog.log("getTimeline: targetDate \(targetDate.description, privacy: .public) is not after now, showing empty state")
      let timeline = Timeline(
        entries: [NextEventEntry(date: now, event: nil)],
        policy: .after(now.addingTimeInterval(30 * 60))
      )
      completion(timeline)
      return
    }

    // Tick every minute in the final hour (so MINS visibly counts down live),
    // every 5 minutes out to 3 hours, hourly further out — all without the
    // app needing to be opened, since WidgetKit renders whichever precomputed
    // entry's date has arrived on its own.
    let minuteWindow: TimeInterval = 60 * 60
    let minuteStep: TimeInterval = 60
    let fineWindow: TimeInterval = 3 * 60 * 60
    let fineStep: TimeInterval = 5 * 60
    let coarseStep: TimeInterval = 60 * 60

    var entries: [NextEventEntry] = []
    var cursor = now
    while cursor < targetDate && entries.count < 300 {
      entries.append(NextEventEntry(date: cursor, event: event))
      let remaining = targetDate.timeIntervalSince(cursor)
      let step: TimeInterval
      if remaining <= minuteWindow {
        step = minuteStep
      } else if remaining <= fineWindow {
        step = fineStep
      } else {
        step = coarseStep
      }
      cursor = cursor.addingTimeInterval(step)
    }
    entries.append(NextEventEntry(date: targetDate, event: event))

    completion(Timeline(entries: entries, policy: .after(targetDate)))
  }
}
