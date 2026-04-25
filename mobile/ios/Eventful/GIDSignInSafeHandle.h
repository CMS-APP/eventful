//
//  GIDSignInSafeHandle.h
//  Eventful
//
//  Wraps GIDSignIn handleURL in @try/@catch to avoid crash when the same
//  OAuth redirect is delivered twice (e.g. Firebase swizzling + our AppDelegate).
//  See: https://github.com/google/GoogleSignIn-iOS/issues/547
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Returns YES if the URL was handled by Google Sign-In, NO otherwise or if an exception was thrown.
BOOL GIDSignInSafeHandleURL(NSURL *url);

NS_ASSUME_NONNULL_END
