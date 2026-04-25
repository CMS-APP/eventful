//
//  GIDSignInSafeHandle.m
//  Eventful
//

#import "GIDSignInSafeHandle.h"
#import <GoogleSignIn/GoogleSignIn.h>

BOOL GIDSignInSafeHandleURL(NSURL *url) {
  @try {
    return [GIDSignIn.sharedInstance handleURL:url];
  } @catch (NSException *exception) {
    // "An OAuth redirect was sent to a OIDExternalUserAgentSession after it already completed."
    // Avoid crash when URL is delivered twice (e.g. user didn't cancel but Firebase + our code both handle).
    return NO;
  }
}
