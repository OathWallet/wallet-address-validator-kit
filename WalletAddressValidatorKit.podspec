Pod::Spec.new do |s|
  s.name = "WalletAddressValidatorKit"
  s.version = "0.2.0"
  s.summary = "Offline blockchain wallet address validation for Bitcoin, Ethereum, Solana, Dogecoin, Litecoin, and more."
  s.homepage = "https://github.com/devdasx/wallet-address-validator-kit"
  s.license = { :type => "MIT", :file => "LICENSE" }
  s.author = { "devdasx" => "royostudios13@gmail.com" }
  s.source = { :git => "https://github.com/devdasx/wallet-address-validator-kit.git", :tag => s.version.to_s }
  s.swift_versions = ["5.9", "5.10", "6.0"]
  s.ios.deployment_target = "15.0"
  s.osx.deployment_target = "13.0"
  s.source_files = "Sources/WalletAddressValidatorKit/**/*.swift"
end
