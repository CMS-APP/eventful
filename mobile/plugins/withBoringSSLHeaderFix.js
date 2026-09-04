const { withPodfile } = require("@expo/config-plugins");
const {
  mergeContents
} = require("@expo/config-plugins/build/utils/generateCode");

const TAG = "withBoringSSLHeaderFix";
const ANCHOR = /post_install do \|installer\|/;
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
