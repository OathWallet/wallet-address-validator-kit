// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WalletAddressValidatorKit",
    platforms: [
        .macOS(.v13),
        .iOS(.v15)
    ],
    products: [
        .library(name: "WalletAddressValidatorKit", targets: ["WalletAddressValidatorKit"])
    ],
    targets: [
        .target(name: "WalletAddressValidatorKit"),
        .testTarget(name: "WalletAddressValidatorKitTests", dependencies: ["WalletAddressValidatorKit"])
    ]
)
