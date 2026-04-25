# Eventful

A React Native mobile application built with Expo. Eventful is an events planning / photo booth application which helps make it easier to host events. All coding has been completed by [Chris Sharp](https://chris-sharp.co.uk).

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com)

For iOS development:

- [Apple Configurator](https://apps.apple.com/gb/app/apple-configurator/id1037126344?mt=12)
- [Transporter](https://apps.apple.com/gb/app/transporter/id1450874784?mt=12)

For Android development:

- [Android Studio](https://developer.android.com/studio)

## Installation & Running

Clone the repository:

```bash
git clone https://github.com/CMS-APP/eventful.git
cd eventful
```

Install dependencies:

```bash
npm install
```

Run Expo prebuild:

```bash
expo prebuild
```

To be able to install the application onto your phone, you will need a development build. This can be created by running the script:

```bash
bash ./scripts/[ios/android]_dev_build.sh
```

Once this build is completed (usually takes around 20 minutes for one build to complete) install using **Configurator** or **Android Studio**.

**_TODO_**: Add steps for development build installation and debugging.

Once installed onto your device, start the development server using:

```bash
npx expo
```

This will start the Expo metro server. Scan the QR code using your device to connect to the server.

## Development Guidelines

1. Before committing run:
   - `npx eslint . --fix`
   - `npx expo-doctor`
   - `npx prettier --write .`
2. Before merging into the main branch run:
   - `bash ./scripts/upload.sh` - This will update the version and build number automatically.
3. Do not commit `./.expo`, `./.vscode`, `./dist`, `./node_modules`, `./builds`, `.env`, `./keys` folder inside scripts into the branch.

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly

2. Delete `node_modules`, `.expo`, `ios`, and `android` folders.

3. Reinstall and run with:

```bash
npm install
expo prebuild
npx expo start -c
```

## Useful Commands

### Permissions

Give you sudo access to the node modules pages:

```bash
$ sudo chown -R $(whoami) /usr/local/lib/node_modules /usr/local/bin
```

### Android

View connected Android Devices:

```bash
adb devices
```

To install a build onto an Android device:

```bash
adb install -r [...].apk
```

### Builds

To create development builts for iOS and Android:

```bash
bash ./scripts/ios-dev-build.sh
bash ./scripts/android-dev-build.sh
```

To upload to the App / Android Store

```bash
bash ./scripts/upload.sh
```

### Codebase Maintenance

Run Expo Doctor

```bash
npx expo-doctor
```

Run Prettier

```bash
npx prettier --write .
```

Run Linter

```bash
npx eslint . --fix
```

### Fastlane Commands

First update brew

```bash
brew update
```

Then update fastlane

```bash
brew install fastlane
```
