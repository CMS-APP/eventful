import SwiftUI

struct EmptyEventView: View {
  var body: some View {
    VStack(spacing: 6) {
      Image(systemName: "calendar")
        .font(.system(size: 20))
        .foregroundColor(.eventfulSecondary)
      Text("No Upcoming\nEvents")
        .font(.eventfulSerif(15))
        .foregroundColor(.eventfulWhite)
        .multilineTextAlignment(.center)
    }
    .padding(16)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    .background(Color.eventfulPrimary)
  }
}
