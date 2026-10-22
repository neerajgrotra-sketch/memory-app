# Building for real phones (EAS)

glance is built in Expo's cloud with **EAS Build** and sent to Apple's TestFlight with **EAS Submit**. You don't need a Mac, Xcode or Android Studio. The `ios/` and `android/` folders are generated during the build, so there are none in the repo.

## What's set up

| File | What it holds |
| --- | --- |
| `app.json` | The app's name, version (`4.10.1`), icons, and its app ID: `com.neerajgrotra.glance` on both iPhone and Android. `ITSAppUsesNonExemptEncryption: false` answers Apple's encryption question (glance uses none), so TestFlight doesn't ask each time. iPad is off for now (`supportsTablet: false`): the App Store would otherwise need iPad screenshots and an iPad-tested layout. |
| `eas.json` | Three build profiles (below). Build numbers are kept by EAS (`appVersionSource: remote`) and go up by themselves for store builds. |
| `assets/icon.png` and `assets/android-icon-*.png` | The app icon: the eye from the launch animation. Made by `scripts/icons/make-icons.js`; run it again after changing the drawing. |

### The profiles

| Profile | For | Tester tools |
| --- | --- | --- |
| `testflight` | **iPhone testing.** A store build sent to TestFlight; testers install it from the TestFlight app. | On (7 taps on the version) |
| `preview` | **Android testing.** An APK file with a download link; open the link on an Android phone to install. | On |
| `production` | **The App Store and Play Store.** | Off: the 7 taps do nothing and a saved tester flag counts for nothing (`EXPO_PUBLIC_TESTER_TOOLS=off`, read in `src/profile/index.tsx`) |

Every build of the same code plays the same; only the tester tools differ.

## Once, before the first build

1. **The app ID.** `com.neerajgrotra.glance` can't be changed once the app is on the App Store. To use a different one (a company domain, say), change `ios.bundleIdentifier` and `android.package` in `app.json` before the first iPhone build.
2. **An Expo account**: free at expo.dev.
3. In the project (Codespaces works):
   ```bash
   npm install
   npx eas-cli@latest login
   npx eas-cli@latest init        # links the project to your Expo account; adds its ID and owner to app.json
   ```
   Commit the change `init` makes to `app.json`.

## iPhone: TestFlight

```bash
npx eas-cli@latest build --platform ios --profile testflight --auto-submit
```

- The first time, it asks you to **sign in with your Apple Developer account** and offers to create the signing certificate and provisioning profile. Say yes: EAS keeps them for every later build.
- It also creates the app in **App Store Connect** if it isn't there yet (it may ask for the app's name; "glance" may be taken on the App Store, so have a second choice ready, like "glance: memory game").
- The build takes about 15 to 30 minutes in the cloud. `--auto-submit` then sends it to TestFlight. Apple processes it for a few minutes to an hour, and emails you.
- **Testers:** in App Store Connect → your app → **TestFlight**:
  - **internal testers** (up to 100 people on your App Store Connect team) can test at once
  - **external testers** (anyone, by email or a public link) need a short Beta App Review of the first build.

  Testers install Apple's **TestFlight** app, accept the invite, and install glance from there.

Without `--auto-submit`, send a finished build with `npx eas-cli@latest submit --platform ios --profile testflight --latest`.

## Android: a test APK

```bash
npx eas-cli@latest build --platform android --profile preview
```

When it's done you get a link and a QR code. Open it on an Android phone, download the APK and allow installing from your browser when asked. No Play Store account is needed for this.

## Releasing to the stores (later)

```bash
npx eas-cli@latest build --platform all --profile production
npx eas-cli@latest submit --platform ios --profile production --latest
```

Before the first store release the app also needs:
- a privacy policy at a public web address
- the store listings (description, keywords, age rating)
- screenshots
- for Google Play, a developer account ($25 once)

See the README's Status section for what else is planned first.

## Notes

- **Version numbers:** the version players see (`4.10.1`) comes from `app.json`; bump it as for every change. The build number underneath is EAS's job.
- **Tester tools in store builds:** they're off in `production` only. Never submit a `testflight` build for App Store review.
- **Expo Go** (`npx expo start --tunnel`) is still the quickest way to try a change on your own phone during development; EAS builds are for testers and the stores.
