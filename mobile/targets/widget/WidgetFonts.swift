import SwiftUI

extension Font {
  static func eventfulSerif(_ size: CGFloat) -> Font {
    .custom("PlayfairDisplay-Regular", size: size)
  }

  static func eventfulLabel(_ size: CGFloat) -> Font {
    .custom("Poppins-Medium", size: size)
  }

  static func eventfulBody(_ size: CGFloat) -> Font {
    .custom("Poppins-Regular", size: size)
  }
}
