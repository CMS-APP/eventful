const { withPodfile } = require("@expo/config-plugins");
const {
  mergeContents
} = require("@expo/config-plugins/build/utils/generateCode");

const TAG = "withBoringSSLHeaderFix";
const ANCHOR = /post_install do \|installer\|/;

// BoringSSL-GRPC's .cc/.m sources #include <openssl/*.h> expecting a plain
// header search path. Under use_frameworks! those headers only get copied
// into the framework's build-product Headers dir by a separate "Copy
// Headers" build phase, and that phase isn't guaranteed to run before
// BoringSSL-GRPC's own sources compile — so on any given build the include
// can randomly resolve against a directory that doesn't exist yet
// ('openssl/ssl.h' file not found). Pointing HEADER_SEARCH_PATHS at the
// pod's source include dir directly sidesteps the race, since those files
// exist from the moment `pod install` finishes.
//
// The same race also bites *other* targets that merely consume the
// openssl_grpc framework (gRPC-Core, gRPC-C++, ...): their own sources
// transitively #include the framework's copied-but-incomplete public
// header, which itself does `#include <openssl/base.h>` and fails the
// same way. So this patch applies to every gRPC/BoringSSL-family target,
// not just BoringSSL-GRPC itself.
//
// openssl/base.h itself also does a bare `#include <boringssl_prefix_symbols.h>`
// (no "openssl/" prefix), which only resolves if that exact file sits
// directly in a search-path directory. Naively adding
// ".../src/include/openssl" itself as a second search path would satisfy
// that — but that directory also contains BoringSSL's own "time.h", and
// exposing it as a bare search root lets `#include <time.h>` anywhere in
// the build (including inside Apple's own libc++ headers, which need the
// *real* system time.h for `struct tm`) resolve to BoringSSL's shadow copy
// instead, breaking unrelated compiles. So instead we copy just the one
// file BoringSSL-GRPC actually needs up into the include dir we already
// expose, rather than exposing the whole openssl/ directory.
const SNIPPET = `
  installer.pods_project.targets.each do |target|
    if target.name =~ /gRPC|BoringSSL/
      target.build_configurations.each do |config|
        header_paths = config.build_settings['HEADER_SEARCH_PATHS']
        header_paths = ['$(inherited)'] if header_paths.nil?
        header_paths = [header_paths] unless header_paths.is_a?(Array)
        header_paths << '"$(PODS_ROOT)/BoringSSL-GRPC/src/include"'
        config.build_settings['HEADER_SEARCH_PATHS'] = header_paths
      end
    end
  end

  require 'fileutils'
  prefix_symbols_src = File.join(installer.sandbox.pod_dir('BoringSSL-GRPC'), 'src', 'include', 'openssl', 'boringssl_prefix_symbols.h')
  prefix_symbols_dest = File.join(installer.sandbox.pod_dir('BoringSSL-GRPC'), 'src', 'include', 'boringssl_prefix_symbols.h')
  if File.exist?(prefix_symbols_src) && !File.exist?(prefix_symbols_dest)
    FileUtils.cp(prefix_symbols_src, prefix_symbols_dest)
  end
`;

module.exports = function withBoringSSLHeaderFix(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = mergeContents({
      src: config.modResults.contents,
      newSrc: SNIPPET,
      tag: TAG,
      anchor: ANCHOR,
      offset: 1,
      comment: "#"
    }).contents;
    return config;
  });
};
